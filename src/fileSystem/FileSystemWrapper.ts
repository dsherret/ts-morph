import * as errors from "./../errors";
import {createHashSet, ArrayUtils, FileUtils} from "./../utils";
import {FileSystemHost} from "./FileSystemHost";

/**
 * File system host wrapper that allows queuing events to the actual file system.
 */
export class FileSystemWrapper {
    // todo: implement this...
    private readonly deleteHashSet = createHashSet<string>();

    constructor(private readonly fileSystem: FileSystemHost) {
    }

    async deleteImmediately(filePath: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        this.deleteHashSet.delete(filePath);
        return this.fileSystem.delete(filePath);
    }

    deleteImmediatelySync(filePath: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        this.deleteHashSet.delete(filePath);
        this.fileSystem.deleteSync(filePath);
    }

    fileExistsSync(filePath: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        if (this.deleteHashSet.has(filePath))
            return false;
        return this.fileSystem.fileExistsSync(filePath);
    }

    directoryExistsSync(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        if (this.deleteHashSet.has(dirPath))
            return false;
        return this.fileSystem.directoryExistsSync(dirPath);
    }

    readFileSync(filePath: string, encoding: string | undefined) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        if (this.deleteHashSet.has(filePath))
            throw new errors.NotImplementedError(`Unexpected: Cannot read file at ${filePath} when it is queued for deletion. Please open an issue if you get this error.`);
        return this.fileSystem.readFileSync(filePath, encoding);
    }

    readDirSync(dirPath: string) {
        dirPath = this.getStandardizedAbsolutePath(dirPath);
        return this.fileSystem.readDirSync(dirPath).filter(path => !this.deleteHashSet.has(path));
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
        return FileUtils.readFileOrNotExists(this.fileSystem, filePath, encoding);
    }

    readFileOrNotExistsSync(filePath: string, encoding: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        return FileUtils.readFileOrNotExistsSync(this.fileSystem, filePath, encoding);
    }

    async writeFile(filePath: string, fileText: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        await FileUtils.ensureDirectoryExists(this.fileSystem, FileUtils.getDirPath(filePath));
        await this.fileSystem.writeFile(filePath, fileText);
    }

    writeFileSync(filePath: string, fileText: string) {
        filePath = this.getStandardizedAbsolutePath(filePath);
        FileUtils.ensureDirectoryExistsSync(this.fileSystem, FileUtils.getDirPath(filePath));
        this.fileSystem.writeFileSync(filePath, fileText);
    }

    glob(patterns: string[]) {
        return this.fileSystem.glob(patterns);
    }
}
