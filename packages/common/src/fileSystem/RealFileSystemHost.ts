import * as nodePath from "path";
import { errors } from "../errors";
import { FileUtils } from "./FileUtils";
import { FileSystemHost } from "./FileSystemHost";

/** An implementation of a file host that interacts with the actual file system. */
export class RealFileSystemHost implements FileSystemHost {
    // Prevent fs-extra and fast-glob from being loaded in environments that don't support it (ex. browsers).
    // This means if someone specifies to use an in-memory file system then it won't load this.
    private fs: typeof import("fs-extra") = require("fs-extra");
    private fastGlob: typeof import("fast-glob") = require("fast-glob");

    /** @inheritdoc */
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

    /** @inheritdoc */
    deleteSync(path: string) {
        try {
            this.fs.unlinkSync(path);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, path);
        }
    }

    /** @inheritdoc */
    readDirSync(dirPath: string) {
        try {
            return this.fs.readdirSync(dirPath).map(name => FileUtils.pathJoin(dirPath, name));
        } catch (err) {
            throw this.getDirectoryNotFoundErrorIfNecessary(err, dirPath);
        }
    }

    /** @inheritdoc */
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

    /** @inheritdoc */
    readFileSync(filePath: string, encoding = "utf-8") {
        try {
            return this.fs.readFileSync(filePath, encoding);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, filePath);
        }
    }

    /** @inheritdoc */
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

    /** @inheritdoc */
    writeFileSync(filePath: string, fileText: string) {
        this.fs.writeFileSync(filePath, fileText);
    }

    /** @inheritdoc */
    async mkdir(dirPath: string) {
        try {
            await this.fs.mkdirp(dirPath);
        } catch (err) {
            // ignore if it already exists
            if (err.code !== "EEXIST")
                throw err;
        }
    }

    /** @inheritdoc */
    mkdirSync(dirPath: string) {
        try {
            this.fs.mkdirpSync(dirPath);
        } catch (err) {
            // ignore if it already exists
            if (err.code !== "EEXIST")
                throw err;
        }
    }

    /** @inheritdoc */
    move(srcPath: string, destPath: string) {
        return this.fs.move(srcPath, destPath, { overwrite: true });
    }

    /** @inheritdoc */
    moveSync(srcPath: string, destPath: string) {
        this.fs.moveSync(srcPath, destPath, { overwrite: true });
    }

    /** @inheritdoc */
    copy(srcPath: string, destPath: string) {
        return this.fs.copy(srcPath, destPath, { overwrite: true });
    }

    /** @inheritdoc */
    copySync(srcPath: string, destPath: string) {
        this.fs.copySync(srcPath, destPath, { overwrite: true });
    }

    /** @inheritdoc */
    fileExists(filePath: string) {
        return new Promise<boolean>(resolve => {
            this.fs.stat(filePath, (err, stat) => {
                if (err)
                    resolve(false);
                else
                    resolve(stat.isFile());
            });
        });
    }

    /** @inheritdoc */
    fileExistsSync(filePath: string) {
        try {
            return this.fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    }

    /** @inheritdoc */
    directoryExists(dirPath: string) {
        return new Promise<boolean>(resolve => {
            this.fs.stat(dirPath, (err, stat) => {
                if (err)
                    resolve(false);
                else
                    resolve(stat.isDirectory());
            });
        });
    }

    /** @inheritdoc */
    directoryExistsSync(dirPath: string) {
        try {
            return this.fs.statSync(dirPath).isDirectory();
        } catch (err) {
            return false;
        }
    }

    /** @inheritdoc */
    realpathSync(path: string) {
        return this.fs.realpathSync(path);
    }

    /** @inheritdoc */
    getCurrentDirectory(): string {
        return FileUtils.standardizeSlashes(nodePath.resolve());
    }

    /** @inheritdoc */
    glob(patterns: ReadonlyArray<string>) {
        return this.fastGlob(backSlashesToForward(patterns), {
            cwd: this.getCurrentDirectory(),
            absolute: true
        });
    }

    /** @inheritdoc */
    globSync(patterns: ReadonlyArray<string>) {
        return this.fastGlob.sync(backSlashesToForward(patterns), {
            cwd: this.getCurrentDirectory(),
            absolute: true
        });
    }

    /** @inheritdoc */
    isCaseSensitive() {
        const platform = process.platform;
        return platform !== "win32" && platform !== "darwin";
    }

    private getDirectoryNotFoundErrorIfNecessary(err: any, path: string) {
        return FileUtils.isNotExistsError(err) ? new errors.DirectoryNotFoundError(FileUtils.getStandardizedAbsolutePath(this, path)) : err;
    }

    private getFileNotFoundErrorIfNecessary(err: any, path: string) {
        return FileUtils.isNotExistsError(err) ? new errors.FileNotFoundError(FileUtils.getStandardizedAbsolutePath(this, path)) : err;
    }
}

function backSlashesToForward(patterns: ReadonlyArray<string>) {
    return patterns.map(p => p.replace(/\\/g, "/")); // maybe this isn't full-proof?
}
