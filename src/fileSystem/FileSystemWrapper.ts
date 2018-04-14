import * as errors from "../errors";
import { createHashSet, HashSet, ArrayUtils, FileUtils } from "../utils";
import { FileSystemHost } from "./FileSystemHost";

/**
 * File system host wrapper that allows queuing deletions to the file system.
 */
export class FileSystemWrapper {
    constructor(private readonly fileSystem: FileSystemHost, private readonly pathsToDelete: HashSet<string> = createHashSet()) {
    }

    queueDelete(path: string) {
        path = this.getStandardizedAbsolutePath(path);
        this.pathsToDelete.add(path);
    }

    dequeueDelete(path: string) {
        path = this.getStandardizedAbsolutePath(path);
        this.removeFromPathsToDelete(path);
    }

    async flush() {
        const pathsToDeleteForFlush = this.getPathsToDeleteForFlush();
        this.pathsToDelete.clear();
        const deletions = pathsToDeleteForFlush.map(path => this.deleteSuppressNotFound(path));
        await Promise.all(deletions);
    }

    flushSync() {
        for (const path of this.getPathsToDeleteForFlush())
            this.deleteImmediatelySync(path);
    }

    private getPathsToDeleteForFlush() {
        // todo: optimize so that if a path's ancestor directory is being deleted, it won't bother deleting the sub paths
        // Need to be mindful of restoring the state in case it fails though.
        return ArrayUtils.sortByProperty(ArrayUtils.from(this.pathsToDelete.values()), a => -1 * a.length);
    }

    async deleteImmediately(path: string) {
        path = this.getStandardizedAbsolutePath(path);
        const pathsToRemove = this.getChildDirsAndFilesFromPathsToDelete(path);
        pathsToRemove.forEach(p => this.pathsToDelete.delete(p));
        this.pathsToDelete.delete(path);
        try {
            await this.deleteSuppressNotFound(path);
        } catch (err) {
            pathsToRemove.forEach(p => this.pathsToDelete.add(p));
            throw err;
        }
    }

    deleteImmediatelySync(path: string) {
        path = this.getStandardizedAbsolutePath(path);
        const pathsToRemove = this.getChildDirsAndFilesFromPathsToDelete(path);
        pathsToRemove.forEach(p => this.pathsToDelete.delete(p));
        this.pathsToDelete.delete(path);
        try {
            this.deleteSuppressNotFoundSync(path);
        } catch (err) {
            pathsToRemove.forEach(p => this.pathsToDelete.add(p));
            throw err;
        }
    }

    private async deleteSuppressNotFound(path: string) {
        try {
            await this.fileSystem.delete(path);
        } catch (err) {
            if (!FileUtils.isNotExistsError(err)) {
                this.pathsToDelete.add(path);
                throw err;
            }
        }
    }

    private deleteSuppressNotFoundSync(path: string) {
        try {
            this.fileSystem.deleteSync(path);
        } catch (err) {
            if (!FileUtils.isNotExistsError(err)) {
                this.pathsToDelete.add(path);
                throw err;
            }
        }
    }

    fileExistsSync(filePath: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        if (this.pathsToDeleteHas(filePath))
            return false;
        return this.fileSystem.fileExistsSync(filePath);
    }

    directoryExists(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        if (this.pathsToDeleteHas(dirPath))
            return Promise.resolve(false);
        return this.fileSystem.directoryExists(dirPath);
    }

    directoryExistsSync(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        if (this.pathsToDeleteHas(dirPath))
            return false;
        return this.fileSystem.directoryExistsSync(dirPath);
    }

    readFileSync(filePath: string, encoding: string | undefined) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        if (this.pathsToDeleteHas(filePath))
            throw new errors.InvalidOperationError(`Cannot read file at ${filePath} when it is queued for deletion.`);
        return this.fileSystem.readFileSync(filePath, encoding);
    }

    readDirSync(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        if (this.pathsToDeleteHas(dirPath))
            throw new errors.InvalidOperationError(`Cannot read directory at ${dirPath} when it is queued for deletion.`);
        return this.fileSystem.readDirSync(dirPath).filter(path => !this.pathsToDelete.has(path));
    }

    glob(patterns: string[]) {
        return this.fileSystem.glob(patterns).filter(path => !this.pathsToDelete.has(path));
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
        if (this.pathsToDeleteHas(filePath))
            return false;
        return FileUtils.readFileOrNotExists(this.fileSystem, filePath, encoding);
    }

    readFileOrNotExistsSync(filePath: string, encoding: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        if (this.pathsToDeleteHas(filePath))
            return false;
        return FileUtils.readFileOrNotExistsSync(this.fileSystem, filePath, encoding);
    }

    async writeFile(filePath: string, fileText: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        this.pathsToDelete.delete(filePath);
        await FileUtils.ensureDirectoryExists(this, FileUtils.getDirPath(filePath));
        await this.fileSystem.writeFile(filePath, fileText);
    }

    writeFileSync(filePath: string, fileText: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        this.pathsToDelete.delete(filePath);
        FileUtils.ensureDirectoryExistsSync(this, FileUtils.getDirPath(filePath));
        this.fileSystem.writeFileSync(filePath, fileText);
    }

    mkdirSync(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        this.removeFromPathsToDelete(dirPath);
        this.fileSystem.mkdirSync(dirPath);
    }

    mkdir(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        this.removeFromPathsToDelete(dirPath);
        return this.fileSystem.mkdir(dirPath);
    }

    private pathsToDeleteHas(path: string) {
        if (this.pathsToDelete.has(path))
            return true;
        const parentDirPath = FileUtils.getDirPath(path);
        if (parentDirPath !== path && this.pathsToDeleteHas(parentDirPath))
            return true;
        return false;
    }

    private removeFromPathsToDelete(path: string) {
        this.pathsToDelete.delete(path);
        const parentDirPath = FileUtils.getDirPath(path);
        if (parentDirPath !== path)
            this.removeFromPathsToDelete(parentDirPath);
    }

    private getChildDirsAndFilesFromPathsToDelete(dirPath: string) {
        return ArrayUtils.from(this.pathsToDelete.values())
            .filter(path => FileUtils.pathStartsWith(path, dirPath));
    }
}
