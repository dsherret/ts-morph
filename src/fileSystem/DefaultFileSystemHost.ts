import * as fs from "fs";
import * as nodePath from "path";
import * as globby from "globby";
import {FileSystemHost} from "./FileSystemHost";
import {FileUtils} from "./../utils";

export class DefaultFileSystemHost implements FileSystemHost {
    delete(path: string) {
        return new Promise<void>((resolve, reject) => {
            fs.unlink(path, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    deleteSync(path: string) {
        fs.unlinkSync(path);
    }

    isDirectorySync(path: string) {
        const stat = this.getStatSync(path);
        return stat == null ? false : stat.isDirectory();
    }

    isFileSync(path: string) {
        const stat = this.getStatSync(path);
        return stat == null ? false : stat.isFile();
    }

    private getStatSync(path: string) {
        try {
            return fs.lstatSync(path);
        } catch {
            return undefined;
        }
    }

    readDirSync(dirPath: string) {
        return fs.readdirSync(dirPath).map(name => FileUtils.pathJoin(dirPath, name));
    }

    readFile(filePath: string, encoding = "utf-8") {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(filePath, encoding, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }

    readFileSync(filePath: string, encoding = "utf-8") {
        return fs.readFileSync(filePath, encoding);
    }

    async writeFile(filePath: string, fileText: string) {
        await FileUtils.ensureDirectoryExists(this, FileUtils.getDirPath(filePath));
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
        FileUtils.ensureDirectoryExistsSync(this, FileUtils.getDirPath(filePath));
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
        return globby.sync(patterns);
    }
}
