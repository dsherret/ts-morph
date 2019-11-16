import { KeyValueCache } from "../collections";
import { errors } from "../errors";
import { FileUtils } from "./FileUtils";
import { matchGlobs } from "./matchGlobs";
import { FileSystemHost } from "./FileSystemHost";

interface VirtualDirectory {
    path: string;
    files: KeyValueCache<string, string>;
}

/** An implementation of a file system that exists in memory only. */
export class InMemoryFileSystemHost implements FileSystemHost {
    private readonly directories = new KeyValueCache<string, VirtualDirectory>();

    constructor() {
        this.getOrCreateDir("/");
    }

    /** @inheritdoc */
    isCaseSensitive() {
        return true;
    }

    /** @inheritdoc */
    delete(path: string) {
        try {
            this.deleteSync(path);
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /** @inheritdoc */
    deleteSync(path: string) {
        path = FileUtils.getStandardizedAbsolutePath(this, path);
        if (this.directories.has(path)) {
            // remove descendant dirs
            for (const descendantDirPath of getDescendantDirectories(this.directories.getKeys(), path))
                this.directories.removeByKey(descendantDirPath);
            // remove this dir
            this.directories.removeByKey(path);
            return;
        }

        const parentDir = this.directories.get(FileUtils.getDirPath(path));
        if (parentDir == null || !parentDir.files.has(path))
            throw new errors.FileNotFoundError(path);
        parentDir.files.removeByKey(path);
    }

    /** @inheritdoc */
    readDirSync(dirPath: string) {
        dirPath = FileUtils.getStandardizedAbsolutePath(this, dirPath);
        const dir = this.directories.get(dirPath);
        if (dir == null)
            throw new errors.DirectoryNotFoundError(dirPath);

        return [...getDirectories(this.directories.getKeys()), ...dir.files.getKeys()];

        function* getDirectories(dirPaths: IterableIterator<string>) {
            for (const path of dirPaths) {
                const parentDir = FileUtils.getDirPath(path);
                if (parentDir === dirPath && parentDir !== path)
                    yield path;
            }
        }
    }

    /** @inheritdoc */
    readFile(filePath: string, encoding = "utf-8") {
        try {
            return Promise.resolve(this.readFileSync(filePath, encoding));
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /** @inheritdoc */
    readFileSync(filePath: string, encoding = "utf-8") {
        filePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        const parentDir = this.directories.get(FileUtils.getDirPath(filePath));
        if (parentDir == null)
            throw new errors.FileNotFoundError(filePath);

        const fileText = parentDir.files.get(filePath);
        if (fileText === undefined)
            throw new errors.FileNotFoundError(filePath);
        return fileText;
    }

    /** @inheritdoc */
    writeFile(filePath: string, fileText: string) {
        this.writeFileSync(filePath, fileText);
        return Promise.resolve();
    }

    /** @inheritdoc */
    writeFileSync(filePath: string, fileText: string) {
        filePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        const dirPath = FileUtils.getDirPath(filePath);
        this.getOrCreateDir(dirPath).files.set(filePath, fileText);
    }

    /** @inheritdoc */
    mkdir(dirPath: string) {
        this.mkdirSync(dirPath);
        return Promise.resolve();
    }

    /** @inheritdoc */
    mkdirSync(dirPath: string) {
        dirPath = FileUtils.getStandardizedAbsolutePath(this, dirPath);
        this.getOrCreateDir(dirPath);
    }

    /** @inheritdoc */
    move(srcPath: string, destPath: string) {
        this.moveSync(srcPath, destPath);
        return Promise.resolve();
    }

    /** @inheritdoc */
    moveSync(srcPath: string, destPath: string) {
        srcPath = FileUtils.getStandardizedAbsolutePath(this, srcPath);
        destPath = FileUtils.getStandardizedAbsolutePath(this, destPath);

        if (this.fileExistsSync(srcPath)) {
            const fileText = this.readFileSync(srcPath);
            this.deleteSync(srcPath);
            this.writeFileSync(destPath, fileText);
        }
        else if (this.directories.has(srcPath)) {
            const moveDirectory = (from: string, to: string) => {
                this._copyDirInternal(from, to);
                this.directories.removeByKey(from);
            };
            moveDirectory(srcPath, destPath);

            // move descendant dirs
            for (const descendantDirPath of getDescendantDirectories(this.directories.getKeys(), srcPath)) {
                const relativePath = FileUtils.getRelativePathTo(srcPath, descendantDirPath);
                moveDirectory(descendantDirPath, FileUtils.pathJoin(destPath, relativePath));
            }
        }
        else {
            throw new errors.PathNotFoundError(srcPath);
        }
    }

    /** @inheritdoc */
    copy(srcPath: string, destPath: string) {
        this.copySync(srcPath, destPath);
        return Promise.resolve();
    }

    /** @inheritdoc */
    copySync(srcPath: string, destPath: string) {
        srcPath = FileUtils.getStandardizedAbsolutePath(this, srcPath);
        destPath = FileUtils.getStandardizedAbsolutePath(this, destPath);

        if (this.fileExistsSync(srcPath))
            this.writeFileSync(destPath, this.readFileSync(srcPath));
        else if (this.directories.has(srcPath)) {
            this._copyDirInternal(srcPath, destPath);

            // copy descendant dirs
            for (const descendantDirPath of getDescendantDirectories(this.directories.getKeys(), srcPath)) {
                const relativePath = FileUtils.getRelativePathTo(srcPath, descendantDirPath);
                this._copyDirInternal(descendantDirPath, FileUtils.pathJoin(destPath, relativePath));
            }
        }
        else {
            throw new errors.PathNotFoundError(srcPath);
        }
    }

    private _copyDirInternal(from: string, to: string) {
        const dir = this.directories.get(from)!;
        const newDir = this.getOrCreateDir(to);

        for (const fileEntry of dir.files.getEntries())
            newDir.files.set(FileUtils.pathJoin(to, FileUtils.getBaseName(fileEntry[0])), fileEntry[1]);
    }

    /** @inheritdoc */
    fileExists(filePath: string) {
        return Promise.resolve<boolean>(this.fileExistsSync(filePath));
    }

    /** @inheritdoc */
    fileExistsSync(filePath: string) {
        filePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        const dirPath = FileUtils.getDirPath(filePath);
        const dir = this.directories.get(dirPath);
        if (dir == null)
            return false;

        return dir.files.has(filePath);
    }

    /** @inheritdoc */
    directoryExists(dirPath: string) {
        return Promise.resolve<boolean>(this.directoryExistsSync(dirPath));
    }

    /** @inheritdoc */
    directoryExistsSync(dirPath: string) {
        dirPath = FileUtils.getStandardizedAbsolutePath(this, dirPath);
        return this.directories.has(dirPath);
    }

    /** @inheritdoc */
    realpathSync(path: string) {
        return path;
    }

    /** @inheritdoc */
    getCurrentDirectory() {
        return "/";
    }

    /** @inheritdoc */
    glob(patterns: ReadonlyArray<string>): Promise<string[]> {
        try {
            return Promise.resolve(this.globSync(patterns));
        } catch (err) {
            return Promise.reject(err);
        }
    }

    /** @inheritdoc */
    globSync(patterns: ReadonlyArray<string>): string[] {
        const allFilePaths = Array.from(getAllFilePaths(this.directories.getValues()));
        return matchGlobs(allFilePaths, patterns, this.getCurrentDirectory());

        function* getAllFilePaths(directories: IterableIterator<VirtualDirectory>) {
            for (const dir of directories)
                yield* dir.files.getKeys();
        }
    }

    private getOrCreateDir(dirPath: string) {
        let dir = this.directories.get(dirPath);

        if (dir == null) {
            dir = { path: dirPath, files: new KeyValueCache<string, string>() };
            this.directories.set(dirPath, dir);
            const parentDirPath = FileUtils.getDirPath(dirPath);
            if (parentDirPath !== dirPath)
                this.getOrCreateDir(parentDirPath);
        }

        return dir;
    }
}

function* getDescendantDirectories(directoryPaths: IterableIterator<string>, dirPath: string) {
    for (const path of directoryPaths) {
        if (FileUtils.pathStartsWith(path, dirPath))
            yield path;
    }
}
