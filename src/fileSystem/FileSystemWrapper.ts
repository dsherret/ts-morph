import * as errors from "../errors";
import { ArrayUtils, FileUtils, KeyValueCache, SortedKeyValueArray, LocaleStringComparer } from "../utils";
import { FileSystemHost } from "./FileSystemHost";

type Operation = DeleteDirectoryOperation | DeleteFileOperation | MoveDirectoryOperation | MakeDirectoryOperation | CopyDirectoryOperation;
type MoveOrCopyOperation = MoveDirectoryOperation | CopyDirectoryOperation;
type MoveCopyOrDeleteOperation = MoveOrCopyOperation | DeleteDirectoryOperation;

interface OperationBase<T> {
    kind: T;
    index: number;
}

interface DeleteFileOperation extends OperationBase<"deleteFile"> {
    filePath: string;
}

interface MakeDirectoryOperation extends OperationBase<"mkdir"> {
    dir: Directory;
}

interface DeleteDirectoryOperation extends OperationBase<"deleteDir"> {
    dir: Directory;
}

interface MoveDirectoryOperation extends OperationBase<"move"> {
    oldDir: Directory;
    newDir: Directory;
}

interface CopyDirectoryOperation extends OperationBase<"copy"> {
    oldDir: Directory;
    newDir: Directory;
}

class Directory {
    readonly operations: Operation[] = [];
    readonly inboundOperations: (MoveDirectoryOperation | CopyDirectoryOperation)[] = [];

    private isDeleted = false;
    private wasEverDeleted = false;
    private parent: Directory | undefined;
    private readonly childDirs = new SortedKeyValueArray<string, Directory>(item => item.path, LocaleStringComparer.instance);

    constructor(public readonly path: string) {
    }

    getExternalOperations() {
        return [
            ...ArrayUtils.flatten(this.getAncestors().map(a => getMoveCopyOrDeleteOperations(a))).filter(o => isAncestorAffectedOperation(this, o)),
            ...ArrayUtils.flatten([this, ...this.getDescendants()].map(d => getMoveOrCopyOperations(d))).filter(o => !isInternalOperation(this, o))
        ];

        function isInternalOperation(thisDir: Directory, operation: MoveDirectoryOperation | CopyDirectoryOperation) {
            return operation.oldDir.isDescendantOrEqual(thisDir) && operation.newDir.isDescendantOrEqual(thisDir);
        }

        function isAncestorAffectedOperation(thisDir: Directory, operation: MoveCopyOrDeleteOperation) {
            switch (operation.kind) {
                case "move":
                case "copy":
                    return thisDir.isDescendantOrEqual(operation.oldDir) || thisDir.isDescendantOrEqual(operation.newDir);
                case "deleteDir":
                    return thisDir.isDescendantOrEqual(operation.dir);
                default:
                    throw errors.getNotImplementedForNeverValueError(operation);
            }
        }

        function getMoveOrCopyOperations(dir: Directory) {
            return dir.operations.filter(o => o.kind === "move" || o.kind === "copy") as MoveOrCopyOperation[];
        }

        function getMoveCopyOrDeleteOperations(dir: Directory) {
            return dir.operations.filter(o => o.kind === "move" || o.kind === "deleteDir" || o.kind === "copy") as MoveCopyOrDeleteOperation[];
        }
    }

    isDescendantOrEqual(directory: Directory) {
        return this.isDescendant(directory) || this === directory;
    }

    isDescendant(directory: Directory) {
        return FileUtils.pathStartsWith(this.path, directory.path);
    }

    getIsDeleted() {
        return this.isDeleted;
    }

    getWasEverDeleted() {
        if (this.wasEverDeleted)
            return true;
        for (const ancestor of this.getAncestorsIterator()) {
            if (ancestor.wasEverDeleted)
                return true;
        }
        return false;
    }

    setIsDeleted(isDeleted: boolean) {
        if (this.isDeleted === isDeleted)
            return;

        if (isDeleted) {
            this.wasEverDeleted = true;
            for (const child of this.childDirs.entries())
                child.setIsDeleted(true);
        }
        else {
            if (this.parent != null)
                this.parent.setIsDeleted(false);
        }

        this.isDeleted = isDeleted;
    }

    getParent() {
        return this.parent;
    }

    setParent(parent: Directory) {
        if (this.parent != null)
            throw new errors.InvalidOperationError("For some reason, a parent was being set when the directory already had a parent. Please open an issue.");

        this.parent = parent;
        parent.childDirs.set(this);
        if (parent.isDeleted && !this.isDeleted)
            parent.setIsDeleted(false);
    }

    removeParent() {
        const parent = this.parent;
        if (parent == null)
            return;

        parent.childDirs.removeByValue(this);
        this.parent = undefined;
    }

    getAncestors() {
        return ArrayUtils.from(this.getAncestorsIterator());
    }

    *getAncestorsIterator() {
        let parent = this.parent;
        while (parent != null) {
            yield parent;
            parent = parent.parent;
        }
    }

    getDescendants() {
        const descendants: Directory[] = [];
        for (const child of this.childDirs.entries()) {
            descendants.push(child);
            descendants.push(...child.getDescendants());
        }
        return descendants;
    }

    isFileQueuedForDelete(filePath: string) {
        return this.hasOperation(operation => operation.kind === "deleteFile" && operation.filePath === filePath);
    }

    private hasOperation(operationMatches: (operation: Operation) => boolean) {
        for (const operation of this.operations) {
            if (operationMatches(operation))
                return true;
        }
        return false;
    }

    dequeueFileDelete(filePath: string) {
        this.removeMatchingOperations(operation => operation.kind === "deleteFile" && operation.filePath === filePath);
    }

    dequeueDirDelete(dirPath: string) {
        this.removeMatchingOperations(operation => operation.kind === "deleteDir" && operation.dir.path === dirPath);
    }

    isRootDir() {
        return FileUtils.isRootDirPath(this.path);
    }

    private removeMatchingOperations(operationMatches: (operation: Operation) => boolean) {
        ArrayUtils.removeAll(this.operations, operationMatches);
    }
}

/**
 * File system host wrapper that allows queuing deletions to the file system.
 */
export class FileSystemWrapper {
    private readonly directories = new KeyValueCache<string, Directory>();

    constructor(private readonly fileSystem: FileSystemHost) {
    }

    queueFileDelete(filePath: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        const parentDir = this.getParentDirectory(filePath);
        parentDir.operations.push({
            kind: "deleteFile",
            index: this.getNextOperationIndex(),
            filePath
        });
    }

    removeFileDelete(filePath: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        this.getParentDirectory(filePath).dequeueFileDelete(filePath);
    }

    queueMkdir(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        const dir = this.getDirectory(dirPath);
        dir.setIsDeleted(false);
        const parentDir = this.getParentDirectory(dirPath);
        parentDir.operations.push({
            kind: "mkdir",
            index: this.getNextOperationIndex(),
            dir
        });
    }

    queueDirectoryDelete(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        const dir = this.getDirectory(dirPath);
        dir.setIsDeleted(true);
        const parentDir = this.getParentDirectory(dirPath);
        parentDir.operations.push({
            kind: "deleteDir",
            index: this.getNextOperationIndex(),
            dir
        });
    }

    queueMoveDirectory(srcPath: string, destPath: string) {
        // todo: tests for the root directory
        srcPath = this.getStandardizedAbsolutePath(srcPath);
        destPath = this.getStandardizedAbsolutePath(destPath);

        const parentDir = this.getParentDirectory(srcPath);
        const moveDir = this.getDirectory(srcPath);
        const destinationDir = this.getDirectory(destPath);

        const moveOperation: MoveDirectoryOperation = {
            kind: "move",
            index: this.getNextOperationIndex(),
            oldDir: moveDir,
            newDir: destinationDir
        };
        parentDir.operations.push(moveOperation);
        (destinationDir.getParent() || destinationDir).inboundOperations.push(moveOperation);
        moveDir.setIsDeleted(true);
    }

    queueCopyDirectory(srcPath: string, destPath: string) {
        srcPath = this.getStandardizedAbsolutePath(srcPath);
        destPath = this.getStandardizedAbsolutePath(destPath);

        const parentDir = this.getParentDirectory(srcPath);
        const copyDir = this.getDirectory(srcPath);
        const destinationDir = this.getDirectory(destPath);

        const copyOperation: CopyDirectoryOperation = {
            kind: "copy",
            index: this.getNextOperationIndex(),
            oldDir: copyDir,
            newDir: destinationDir
        };
        parentDir.operations.push(copyOperation);
        (destinationDir.getParent() || destinationDir).inboundOperations.push(copyOperation);
    }

    async flush() {
        const operations = this.getAndClearOperations();
        for (const operation of operations)
            await this.executeOperation(operation);
    }

    flushSync() {
        for (const operation of this.getAndClearOperations())
            this.executeOperationSync(operation);
    }

    async saveForDirectory(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        const dir = this.getDirectory(dirPath);
        this.throwIfHasExternalOperations(dir, "save directory");
        const operations = this.getAndClearOperationsForDir(dir);

        // await after the state is set
        await this.ensureDirectoryExists(dirPath);
        for (const operation of operations)
            await this.executeOperation(operation);
    }

    saveForDirectorySync(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        const dir = this.getDirectory(dirPath);
        this.throwIfHasExternalOperations(dir, "save directory");

        this.ensureDirectoryExistsSync(dirPath);

        for (const operation of this.getAndClearOperationsForDir(dir))
            this.executeOperationSync(operation);
    }

    private getAndClearOperationsForDir(dir: Directory) {
        const operations: Operation[] = getAndClearParentMkDirOperations(dir.getParent(), dir);
        for (const currentDir of [dir, ...dir.getDescendants()])
            operations.push(...currentDir.operations);
        ArrayUtils.sortByProperty(operations, item => item.index);
        this.removeDirAndSubDirs(dir);
        return operations;

        function getAndClearParentMkDirOperations(parentDir: Directory | undefined, childDir: Directory): Operation[] {
            if (parentDir == null)
                return [];

            const parentOperations = ArrayUtils.removeAll(parentDir.operations, operation => operation.kind === "mkdir" && operation.dir === childDir);
            return [...parentOperations, ...getAndClearParentMkDirOperations(parentDir.getParent(), parentDir)];
        }
    }

    private async executeOperation(operation: Operation) {
        switch (operation.kind) {
            case "deleteDir":
                await this.deleteSuppressNotFound(operation.dir.path);
                break;
            case "deleteFile":
                await this.deleteSuppressNotFound(operation.filePath);
                break;
            case "move":
                await this.fileSystem.move(operation.oldDir.path, operation.newDir.path);
                break;
            case "copy":
                await this.fileSystem.copy(operation.oldDir.path, operation.newDir.path);
                break;
            case "mkdir":
                await this.fileSystem.mkdir(operation.dir.path);
                break;
            default:
                throw errors.getNotImplementedForNeverValueError(operation);
        }
    }

    private executeOperationSync(operation: Operation) {
        switch (operation.kind) {
            case "deleteDir":
                this.deleteSuppressNotFoundSync(operation.dir.path);
                break;
            case "deleteFile":
                this.deleteSuppressNotFoundSync(operation.filePath);
                break;
            case "move":
                this.fileSystem.moveSync(operation.oldDir.path, operation.newDir.path);
                break;
            case "copy":
                this.fileSystem.copySync(operation.oldDir.path, operation.newDir.path);
                break;
            case "mkdir":
                this.fileSystem.mkdirSync(operation.dir.path);
                break;
            default:
                throw errors.getNotImplementedForNeverValueError(operation);
        }
    }

    private getAndClearOperations() {
        const operations: Operation[] = [];
        for (const dir of this.directories.getValues())
            operations.push(...dir.operations);
        ArrayUtils.sortByProperty(operations, item => item.index);
        this.directories.clear();
        return operations;
    }

    async moveFileImmediately(oldFilePath: string, newFilePath: string, fileText: string) {
        oldFilePath = this.getStandardizedAbsolutePath(oldFilePath);
        newFilePath = this.getStandardizedAbsolutePath(newFilePath);

        this.throwIfHasExternalOperations(this.getParentDirectory(oldFilePath), "move file");
        this.throwIfHasExternalOperations(this.getParentDirectory(newFilePath), "move file");

        await this.deleteFileImmediately(oldFilePath);
        await this.writeFile(newFilePath, fileText);
    }

    moveFileImmediatelySync(oldFilePath: string, newFilePath: string, fileText: string) {
        oldFilePath = this.getStandardizedAbsolutePath(oldFilePath);
        newFilePath = this.getStandardizedAbsolutePath(newFilePath);

        this.throwIfHasExternalOperations(this.getParentDirectory(oldFilePath), "move file");
        this.throwIfHasExternalOperations(this.getParentDirectory(newFilePath), "move file");

        this.deleteFileImmediatelySync(oldFilePath);
        this.writeFileSync(newFilePath, fileText);
    }

    async deleteFileImmediately(filePath: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        const dir = this.getParentDirectory(filePath);

        this.throwIfHasExternalOperations(dir, "delete file");
        dir.dequeueFileDelete(filePath);

        try {
            await this.deleteSuppressNotFound(filePath);
        } catch (err) {
            this.queueFileDelete(filePath);
            throw err;
        }
    }

    deleteFileImmediatelySync(filePath: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        const dir = this.getParentDirectory(filePath);

        this.throwIfHasExternalOperations(dir, "delete file");
        dir.dequeueFileDelete(filePath);

        try {
            this.deleteSuppressNotFoundSync(filePath);
        } catch (err) {
            this.queueFileDelete(filePath);
            throw err;
        }
    }

    async copyDirectoryImmediately(srcDirPath: string, destDirPath: string) {
        srcDirPath = this.getStandardizedAbsolutePath(srcDirPath);
        destDirPath = this.getStandardizedAbsolutePath(destDirPath);
        const srcDir = this.getDirectory(srcDirPath);
        const destDir = this.getDirectory(destDirPath);

        this.throwIfHasExternalOperations(srcDir, "copy directory");
        this.throwIfHasExternalOperations(destDir, "copy directory");

        const saveTask = Promise.all([this.saveForDirectory(srcDirPath), this.saveForDirectory(destDirPath)]);
        this.removeDirAndSubDirs(srcDir);

        // await after the state is set
        await saveTask;
        await this.fileSystem.copy(srcDirPath, destDirPath);
    }

    copyDirectoryImmediatelySync(srcDirPath: string, destDirPath: string) {
        srcDirPath = this.getStandardizedAbsolutePath(srcDirPath);
        destDirPath = this.getStandardizedAbsolutePath(destDirPath);
        const srcDir = this.getDirectory(srcDirPath);
        const destDir = this.getDirectory(destDirPath);

        this.throwIfHasExternalOperations(srcDir, "copy directory");
        this.throwIfHasExternalOperations(destDir, "copy directory");

        this.saveForDirectorySync(srcDirPath);
        this.saveForDirectorySync(destDirPath);
        this.removeDirAndSubDirs(srcDir);

        this.fileSystem.copySync(srcDirPath, destDirPath);
    }

    async moveDirectoryImmediately(srcDirPath: string, destDirPath: string) {
        srcDirPath = this.getStandardizedAbsolutePath(srcDirPath);
        destDirPath = this.getStandardizedAbsolutePath(destDirPath);
        const srcDir = this.getDirectory(srcDirPath);
        const destDir = this.getDirectory(destDirPath);

        this.throwIfHasExternalOperations(srcDir, "move directory");
        this.throwIfHasExternalOperations(destDir, "move directory");

        const saveTask = Promise.all([this.saveForDirectory(srcDirPath), this.saveForDirectory(destDirPath)]);
        this.removeDirAndSubDirs(srcDir);

        // await after the state is set
        await saveTask;
        await this.fileSystem.move(srcDirPath, destDirPath);
    }

    moveDirectoryImmediatelySync(srcDirPath: string, destDirPath: string) {
        srcDirPath = this.getStandardizedAbsolutePath(srcDirPath);
        destDirPath = this.getStandardizedAbsolutePath(destDirPath);
        const srcDir = this.getDirectory(srcDirPath);
        const destDir = this.getDirectory(destDirPath);

        this.throwIfHasExternalOperations(srcDir, "move directory");
        this.throwIfHasExternalOperations(destDir, "move directory");

        this.saveForDirectorySync(srcDirPath);
        this.saveForDirectorySync(destDirPath);
        this.removeDirAndSubDirs(srcDir);

        this.fileSystem.moveSync(srcDirPath, destDirPath);
    }

    async deleteDirectoryImmediately(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        const dir = this.getDirectory(dirPath);

        this.throwIfHasExternalOperations(dir, "delete");
        this.removeDirAndSubDirs(dir);

        try {
            await this.deleteSuppressNotFound(dirPath);
        } catch (err) {
            this.addBackDirAndSubDirs(dir);
            this.queueDirectoryDelete(dirPath);
        }

    }

    deleteDirectoryImmediatelySync(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        const dir = this.getDirectory(dirPath);

        this.throwIfHasExternalOperations(dir, "delete");
        this.removeDirAndSubDirs(dir);

        try {
            this.deleteSuppressNotFoundSync(dirPath);
        } catch (err) {
            this.addBackDirAndSubDirs(dir);
            this.queueDirectoryDelete(dirPath);
        }
    }

    private async deleteSuppressNotFound(path: string) {
        try {
            await this.fileSystem.delete(path);
        } catch (err) {
            if (!FileUtils.isNotExistsError(err))
                throw err;
        }
    }

    private deleteSuppressNotFoundSync(path: string) {
        try {
            this.fileSystem.deleteSync(path);
        } catch (err) {
            if (!FileUtils.isNotExistsError(err))
                throw err;
        }
    }

    fileExistsSync(filePath: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        if (this.isPathQueuedForDeletion(filePath))
            return false;
        if (this.getParentDirectory(filePath).getWasEverDeleted())
            return false;
        return this.fileSystem.fileExistsSync(filePath);
    }

    directoryExistsSync(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        if (this.isPathQueuedForDeletion(dirPath))
            return false;
        if (this.isPathDirectoryInQueueThatExists(dirPath))
            return true;
        if (this.getDirectory(dirPath).getWasEverDeleted())
            return false;
        return this.fileSystem.directoryExistsSync(dirPath);
    }

    readFileSync(filePath: string, encoding: string | undefined) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        if (this.isPathQueuedForDeletion(filePath))
            throw new errors.InvalidOperationError(`Cannot read file at ${filePath} when it is queued for deletion.`);
        if (this.getParentDirectory(filePath).getWasEverDeleted())
            throw new errors.InvalidOperationError(`Cannot read file at ${filePath} because one of its ancestor directories was once deleted or moved.`);
        return this.fileSystem.readFileSync(filePath, encoding);
    }

    readDirSync(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        const dir = this.getDirectory(dirPath);
        if (dir.getIsDeleted())
            throw new errors.InvalidOperationError(`Cannot read directory at ${dirPath} when it is queued for deletion.`);
        if (dir.getWasEverDeleted())
            throw new errors.InvalidOperationError(`Cannot read directory at ${dirPath} because one of its ancestor directories was once deleted or moved.`);
        return this.fileSystem.readDirSync(dirPath).filter(path => !this.isPathQueuedForDeletion(path) && !this.isPathQueuedForDeletion(path));
    }

    glob(patterns: string[]) {
        return this.fileSystem.glob(patterns).filter(path => !this.isPathQueuedForDeletion(path));
    }

    getFileSystem() {
        return this.fileSystem;
    }

    getCurrentDirectory() {
        return this.fileSystem.getCurrentDirectory();
    }

    getStandardizedAbsolutePath(fileOrDirPath: string, relativeBase?: string) {
        return FileUtils.getStandardizedAbsolutePath(this.fileSystem, fileOrDirPath, relativeBase);
    }

    readFileOrNotExists(filePath: string, encoding: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        if (this.isPathQueuedForDeletion(filePath))
            return false;
        return FileUtils.readFileOrNotExists(this.fileSystem, filePath, encoding);
    }

    readFileOrNotExistsSync(filePath: string, encoding: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        if (this.isPathQueuedForDeletion(filePath))
            return false;
        return FileUtils.readFileOrNotExistsSync(this.fileSystem, filePath, encoding);
    }

    async writeFile(filePath: string, fileText: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        const parentDir = this.getParentDirectory(filePath);
        this.throwIfHasExternalOperations(parentDir, "write file");
        parentDir.dequeueFileDelete(filePath);
        await this.ensureDirectoryExists(parentDir.path);
        await this.fileSystem.writeFile(filePath, fileText);
    }

    writeFileSync(filePath: string, fileText: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        const parentDir = this.getParentDirectory(filePath);
        this.throwIfHasExternalOperations(parentDir, "write file");
        parentDir.dequeueFileDelete(filePath);
        this.ensureDirectoryExistsSync(parentDir.path);
        this.fileSystem.writeFileSync(filePath, fileText);
    }

    private isPathDirectoryInQueueThatExists(path: string) {
        const pathDir = this.getDirectoryIfExists(path);
        return pathDir == null ? false : !pathDir.getIsDeleted();
    }

    private isPathQueuedForDeletion(path: string) {
        // check if the provided path is a dir and if it's deleted
        const pathDir = this.getDirectoryIfExists(path);
        if (pathDir != null)
            return pathDir.getIsDeleted();

        // check if the provided path is a file or if it or its parent is deleted
        const parentDir = this.getParentDirectory(path);
        return parentDir.isFileQueuedForDelete(path) || parentDir.getIsDeleted();
    }

    private removeDirAndSubDirs(dir: Directory) {
        const originalParent = dir.getParent();
        dir.removeParent();
        for (const dirToRemove of [dir, ...dir.getDescendants()])
            this.directories.removeByKey(dirToRemove.path);
        if (originalParent != null)
            originalParent.dequeueDirDelete(dir.path);
    }

    private addBackDirAndSubDirs(dir: Directory) {
        for (const dirToAdd of [dir, ...dir.getDescendants()])
            this.directories.set(dirToAdd.path, dirToAdd);
        if (!dir.isRootDir())
            dir.setParent(this.getParentDirectory(dir.path));
    }

    private operationIndex = 0;

    private getNextOperationIndex() {
        return this.operationIndex++;
    }

    private getParentDirectory(filePath: string) {
        return this.getDirectory(FileUtils.getDirPath(filePath));
    }

    private getDirectoryIfExists(dirPath: string) {
        return this.directories.get(dirPath);
    }

    private getDirectory(dirPath: string) {
        let dir = this.directories.get(dirPath);
        if (dir != null)
            return dir;

        const getOrCreateDir = (creatingDirPath: string) => this.directories.getOrCreate(creatingDirPath, () => new Directory(creatingDirPath));
        dir = getOrCreateDir(dirPath);
        let currentDirPath = dirPath;
        let currentDir = dir;

        while (!FileUtils.isRootDirPath(currentDirPath)) {
            const nextDirPath = FileUtils.getDirPath(currentDirPath);
            const hadNextDir = this.directories.has(nextDirPath);
            const nextDir = getOrCreateDir(nextDirPath);

            currentDir.setParent(nextDir);

            if (hadNextDir)
                return dir;

            currentDir = nextDir;
            currentDirPath = nextDirPath;
        }

        return dir;
    }

    private throwIfHasExternalOperations(dir: Directory, commandName: string) {
        const operations = dir.getExternalOperations();
        if (operations.length === 0)
            return;

        throw new errors.InvalidOperationError(getErrorText());

        function getErrorText() {
            let hasCopy = false;
            let errorText = `Cannot execute immediate operation '${commandName}' because of the following external operations:\n`;
            for (const operation of operations) {
                if (operation.kind === "move")
                    errorText += `\n* Move: ${operation.oldDir.path} --> ${operation.newDir.path}`;
                else if (operation.kind === "copy") {
                    errorText += `\n* Copy: ${operation.oldDir.path} --> ${operation.newDir.path}`;
                    hasCopy = true;
                }
                else if (operation.kind === "deleteDir")
                    errorText += `\n* Delete: ${operation.dir.path}`;
                else {
                    const expectNever: never = operation;
                    errorText += `\n* Unknown operation: Please report this as a bug.`;
                }
            }

            if (hasCopy)
                errorText += "\n\nNote: Copy operations can be removed from external operations by setting `includeUntrackedFiles` to `false` when copying.";

            return errorText;
        }
    }

    private async ensureDirectoryExists(dirPath: string) {
        if (await this.fileSystem.directoryExists(dirPath))
            return;

        // ensure the parent exists and is not the root
        const parentDirPath = FileUtils.getDirPath(dirPath);
        if (parentDirPath !== dirPath && !FileUtils.isRootDirPath(parentDirPath))
            await this.ensureDirectoryExists(parentDirPath);

        // make this directory
        this.removeMkDirOperationsForDir(dirPath);
        await this.fileSystem.mkdir(dirPath);
    }

    private ensureDirectoryExistsSync(dirPath: string) {
        if (this.fileSystem.directoryExistsSync(dirPath))
            return;

        // ensure the parent exists and is not the root
        const parentDirPath = FileUtils.getDirPath(dirPath);
        if (parentDirPath !== dirPath && !FileUtils.isRootDirPath(parentDirPath))
            this.ensureDirectoryExistsSync(parentDirPath);

        // make this directory
        this.removeMkDirOperationsForDir(dirPath);
        this.fileSystem.mkdirSync(dirPath);
    }

    private removeMkDirOperationsForDir(dirPath: string) {
        const dir = this.getDirectory(dirPath);
        const parentDir = this.getParentDirectory(dirPath);
        ArrayUtils.removeAll(parentDir.operations, operation => operation.kind === "mkdir" && operation.dir === dir);
    }
}
