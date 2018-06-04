import * as fs from "fs-extra";
import * as globby from "globby";
import * as nodePath from "path";
import * as errors from "../errors";
import { FileUtils } from "../utils";
import { FileSystemHost } from "./FileSystemHost";

export class DefaultFileSystemHost implements FileSystemHost {
    delete(path: string) {
        return new Promise<void>((resolve, reject) => {
            fs.unlink(path, err => {
                if (err)
                    reject(this.getFileNotFoundErrorIfNecessary(err, path));
                else
                    resolve();
            });
        });
    }

    deleteSync(path: string) {
        try {
            fs.unlinkSync(path);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, path);
        }
    }

    readDirSync(dirPath: string) {
        try {
            return fs.readdirSync(dirPath).map(name => FileUtils.pathJoin(dirPath, name));
        } catch (err) {
            throw this.getDirectoryNotFoundErrorIfNecessary(err, dirPath);
        }
    }

    readFile(filePath: string, encoding = "utf-8") {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(filePath, encoding, (err, data) => {
                if (err)
                    reject(this.getFileNotFoundErrorIfNecessary(err, filePath));
                else
                    resolve(data);
            });
        });
    }

    readFileSync(filePath: string, encoding = "utf-8") {
        try {
            return fs.readFileSync(filePath, encoding);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, filePath);
        }
    }

    async writeFile(filePath: string, fileText: string) {
        await new Promise<void>((resolve, reject) => {
            fs.writeFile(filePath, fileText, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    writeFileSync(filePath: string, fileText: string) {
        fs.writeFileSync(filePath, fileText);
    }

    mkdir(dirPath: string) {
        return new Promise<void>((resolve, reject) => {
            fs.mkdir(dirPath, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    mkdirSync(dirPath: string) {
        fs.mkdirSync(dirPath);
    }

    move(srcPath: string, destPath: string) {
        return fs.move(srcPath, destPath, { overwrite: true });
    }

    moveSync(srcPath: string, destPath: string) {
        fs.moveSync(srcPath, destPath, { overwrite: true });
    }

    copy(srcPath: string, destPath: string) {
        return fs.copy(srcPath, destPath, { overwrite: true });
    }

    copySync(srcPath: string, destPath: string) {
        fs.copySync(srcPath, destPath, { overwrite: true });
    }

    fileExists(filePath: string) {
        return new Promise<boolean>((resolve, reject) => {
            fs.stat(filePath, (err, stat) => {
                if (err)
                    resolve(false);
                else
                    resolve(stat.isFile());
            });
        });
    }

    fileExistsSync(filePath: string) {
        try {
            return fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    }

    directoryExists(dirPath: string) {
        return new Promise<boolean>((resolve, reject) => {
            fs.stat(dirPath, (err, stat) => {
                if (err)
                    resolve(false);
                else
                    resolve(stat.isDirectory());
            });
        });
    }

    directoryExistsSync(dirPath: string) {
        try {
            return fs.statSync(dirPath).isDirectory();
        } catch (err) {
            return false;
        }
    }

    getCurrentDirectory(): string {
        return FileUtils.standardizeSlashes(nodePath.resolve());
    }

    glob(patterns: string[]) {
        return globby.sync(patterns, {
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
