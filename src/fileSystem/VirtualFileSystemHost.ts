import * as errors from "./../errors";
import {KeyValueCache} from "./../utils";
import {FileSystemHost} from "./FileSystemHost";

export class VirtualFileSystemHost implements FileSystemHost {
    private readonly files = new KeyValueCache<string, string>();

    delete(path: string) {
        this.deleteSync(path);
        return Promise.resolve();
    }

    deleteSync(path: string) {
        this.files.removeByKey(path);
    }

    readFile(filePath: string, encoding = "utf-8") {
        return Promise.resolve(this.readFileSync(filePath, encoding));
    }

    readFileSync(filePath: string, encoding = "utf-8") {
        const fileText = this.files.get(filePath);
        if (fileText == null)
            throw new errors.FileNotFoundError(filePath);
        return fileText;
    }

    writeFile(filePath: string, fileText: string) {
        this.files.set(filePath, fileText);
        return Promise.resolve();
    }

    writeFileSync(filePath: string, fileText: string) {
        this.files.set(filePath, fileText);
    }

    mkdir(dirPath: string) {
        // do nothing
        return Promise.resolve();
    }

    mkdirSync(dirPath: string) {
        // do nothing
    }

    fileExists(filePath: string) {
        return Promise.resolve<boolean>(this.files.has(filePath));
    }

    fileExistsSync(filePath: string) {
        return this.files.has(filePath);
    }

    directoryExists(dirPath: string) {
        return Promise.resolve<boolean>(true);
    }

    directoryExistsSync(dirPath: string) {
        return true;
    }

    getCurrentDirectory() {
        return "/";
    }

    glob(patterns: string[]): string[] {
        throw new errors.NotImplementedError("Glob is not implemented for a virtual file system.");
    }
}
