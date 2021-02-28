import { errors } from "../errors";
import { runtime } from "../runtimes";
import { FileSystemHost } from "./FileSystemHost";
import { FileUtils } from "./FileUtils";

const fs = runtime.fs;

/** An implementation of a file host that interacts with the actual file system. */
export class RealFileSystemHost implements FileSystemHost {
    /** @inheritdoc */
    async delete(path: string) {
        try {
            await fs.delete(path);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, path);
        }
    }

    /** @inheritdoc */
    deleteSync(path: string) {
        try {
            fs.deleteSync(path);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, path);
        }
    }

    /** @inheritdoc */
    readDirSync(dirPath: string) {
        try {
            return fs.readDirSync(dirPath).map(name => FileUtils.pathJoin(dirPath, name));
        } catch (err) {
            throw this.getDirectoryNotFoundErrorIfNecessary(err, dirPath);
        }
    }

    /** @inheritdoc */
    async readFile(filePath: string, encoding = "utf-8") {
        try {
            return await fs.readFile(filePath, encoding);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, filePath);
        }
    }

    /** @inheritdoc */
    readFileSync(filePath: string, encoding = "utf-8") {
        try {
            return fs.readFileSync(filePath, encoding);
        } catch (err) {
            throw this.getFileNotFoundErrorIfNecessary(err, filePath);
        }
    }

    /** @inheritdoc */
    async writeFile(filePath: string, fileText: string) {
        return fs.writeFile(filePath, fileText);
    }

    /** @inheritdoc */
    writeFileSync(filePath: string, fileText: string) {
        fs.writeFileSync(filePath, fileText);
    }

    /** @inheritdoc */
    mkdir(dirPath: string) {
        return fs.mkdir(dirPath);
    }

    /** @inheritdoc */
    mkdirSync(dirPath: string) {
        fs.mkdirSync(dirPath);
    }

    /** @inheritdoc */
    move(srcPath: string, destPath: string) {
        return fs.move(srcPath, destPath);
    }

    /** @inheritdoc */
    moveSync(srcPath: string, destPath: string) {
        fs.moveSync(srcPath, destPath);
    }

    /** @inheritdoc */
    copy(srcPath: string, destPath: string) {
        return fs.copy(srcPath, destPath);
    }

    /** @inheritdoc */
    copySync(srcPath: string, destPath: string) {
        fs.copySync(srcPath, destPath);
    }

    /** @inheritdoc */
    fileExists(filePath: string) {
        return fs.fileExists(filePath);
    }

    /** @inheritdoc */
    fileExistsSync(filePath: string) {
        return fs.fileExistsSync(filePath);
    }

    /** @inheritdoc */
    directoryExists(dirPath: string) {
        return fs.directoryExists(dirPath);
    }

    /** @inheritdoc */
    directoryExistsSync(dirPath: string) {
        return fs.directoryExistsSync(dirPath);
    }

    /** @inheritdoc */
    realpathSync(path: string) {
        return fs.realpathSync(path);
    }

    /** @inheritdoc */
    getCurrentDirectory(): string {
        return FileUtils.standardizeSlashes(fs.getCurrentDirectory());
    }

    /** @inheritdoc */
    glob(patterns: ReadonlyArray<string>) {
        return fs.glob(backSlashesToForward(patterns));
    }

    /** @inheritdoc */
    globSync(patterns: ReadonlyArray<string>) {
        return fs.globSync(backSlashesToForward(patterns));
    }

    /** @inheritdoc */
    isCaseSensitive() {
        return fs.isCaseSensitive();
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
