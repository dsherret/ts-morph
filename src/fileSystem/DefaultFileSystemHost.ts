import * as nodePath from "path";
import * as errors from "../errors";
import { FileUtils } from "../utils";
import { FileSystemHost } from "./FileSystemHost";

export class DefaultFileSystemHost implements FileSystemHost {
    // Prevent "fs-extra" and "globby" from being loaded in environments that don't support it (ex. browsers).
    // This means if someone specifies to use a virtual file system then it won't load this.
    private fs: typeof import ("fs-extra") = require("fs-extra");
    private globby: typeof import ("globby") = require("globby");

    delete(path: string) {
        return new Promise<void>((resolve, reject) => {
            this.fs.unlink(path, err => {
                if (err)
                    reject(this.getFileNotFoundErrorIfNecessary(err, path));
                else
                    resolve();
            });
        });
    }

    deleteSync(path: string) {
        try {
            this.fs.unlinkSync(path);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, path);
        }
    }

    readDirSync(dirPath: string) {
        try {
            return this.fs.readdirSync(dirPath).map(name => FileUtils.pathJoin(dirPath, name));
        } catch (err) {
            throw this.getDirectoryNotFoundErrorIfNecessary(err, dirPath);
        }
    }

    readFile(filePath: string, encoding = "utf-8") {
        return new Promise<string>((resolve, reject) => {
            this.fs.readFile(filePath, encoding, (err, data) => {
                if (err)
                    reject(this.getFileNotFoundErrorIfNecessary(err, filePath));
                else
                    resolve(data);
            });
        });
    }

    readFileSync(filePath: string, encoding = "utf-8") {
        try {
            return this.fs.readFileSync(filePath, encoding);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, filePath);
        }
    }

    async writeFile(filePath: string, fileText: string) {
        await new Promise<void>((resolve, reject) => {
            this.fs.writeFile(filePath, fileText, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    writeFileSync(filePath: string, fileText: string) {
        this.fs.writeFileSync(filePath, fileText);
    }

    mkdir(dirPath: string) {
        return new Promise<void>((resolve, reject) => {
            this.fs.mkdir(dirPath, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    mkdirSync(dirPath: string) {
        this.fs.mkdirSync(dirPath);
    }

    move(srcPath: string, destPath: string) {
        return this.fs.move(srcPath, destPath, { overwrite: true });
    }

    moveSync(srcPath: string, destPath: string) {
        this.fs.moveSync(srcPath, destPath, { overwrite: true });
    }

    copy(srcPath: string, destPath: string) {
        return this.fs.copy(srcPath, destPath, { overwrite: true });
    }

    copySync(srcPath: string, destPath: string) {
        this.fs.copySync(srcPath, destPath, { overwrite: true });
    }

    fileExists(filePath: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.fs.stat(filePath, (err, stat) => {
                if (err)
                    resolve(false);
                else
                    resolve(stat.isFile());
            });
        });
    }

    fileExistsSync(filePath: string) {
        try {
            return this.fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    }

    directoryExists(dirPath: string) {
        return new Promise<boolean>((resolve, reject) => {
            this.fs.stat(dirPath, (err, stat) => {
                if (err)
                    resolve(false);
                else
                    resolve(stat.isDirectory());
            });
        });
    }

    directoryExistsSync(dirPath: string) {
        try {
            return this.fs.statSync(dirPath).isDirectory();
        } catch (err) {
            return false;
        }
    }

    getCurrentDirectory(): string {
        return FileUtils.standardizeSlashes(nodePath.resolve());
    }

    glob(patterns: string[]) {
        return this.globby.sync(patterns, {
            cwd: this.getCurrentDirectory(),
            absolute: true
        });
    }

    private getDirectoryNotFoundErrorIfNecessary(err: any, path: string) {
        return FileUtils.isNotExistsError(err) ? new errors.DirectoryNotFoundError(path) : err;
    }

    private getFileNotFoundErrorIfNecessary(err: any, path: string) {
        return FileUtils.isNotExistsError(err) ? new errors.FileNotFoundError(path) : err;
    }
}
