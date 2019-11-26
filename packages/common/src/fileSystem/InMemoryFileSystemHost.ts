import { errors } from "../errors";
import { getLibFiles } from "../getLibFiles";
import { FileUtils } from "./FileUtils";
import { matchGlobs } from "./matchGlobs";
import { FileSystemHost } from "./FileSystemHost";
import { StandardizedFilePath } from "./StandardizedFilePath";

interface VirtualDirectory {
    path: StandardizedFilePath;
    files: Map<StandardizedFilePath, string>;
}

export interface InMemoryFileSystemHostOptions {
    /**
     * Set this to true to not load the /node_modules/typescript/lib files on construction.
     * @default false
     */
    skipLoadingLibFiles?: boolean;
}

/** An implementation of a file system that exists in memory only. */
export class InMemoryFileSystemHost implements FileSystemHost {
    /** @internal */
    private readonly directories = new Map<StandardizedFilePath, VirtualDirectory>();

    /**
     * Constructor.
     * @param options - Options for creating the file system.
     */
    constructor(options?: InMemoryFileSystemHostOptions) {
        this.getOrCreateDir("/" as StandardizedFilePath);

        if (!options?.skipLoadingLibFiles) {
            const libFiles = getLibFiles();
            for (const libFile of libFiles)
                this._writeFileSync(`/node_modules/typescript/lib/${libFile.fileName}`, libFile.text);
        }
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
        const standardizedPath = FileUtils.getStandardizedAbsolutePath(this, path);
        if (this.directories.has(standardizedPath)) {
            // remove descendant dirs
            for (const descendantDirPath of getDescendantDirectories(this.directories.keys(), standardizedPath))
                this.directories.delete(descendantDirPath);
            // remove this dir
            this.directories.delete(standardizedPath);
            return;
        }

        const parentDir = this.directories.get(FileUtils.getDirPath(standardizedPath));
        if (parentDir == null || !parentDir.files.has(standardizedPath))
            throw new errors.FileNotFoundError(standardizedPath);
        parentDir.files.delete(standardizedPath);
    }

    /** @inheritdoc */
    readDirSync(dirPath: string): string[] {
        const standardizedDirPath = FileUtils.getStandardizedAbsolutePath(this, dirPath);
        const dir = this.directories.get(standardizedDirPath);
        if (dir == null)
            throw new errors.DirectoryNotFoundError(standardizedDirPath);

        return [...getDirectories(this.directories.keys()), ...dir.files.keys()];

        function* getDirectories(dirPaths: IterableIterator<StandardizedFilePath>) {
            for (const path of dirPaths) {
                const parentDir = FileUtils.getDirPath(path);
                if (parentDir === standardizedDirPath && parentDir !== path)
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
        const standardizedFilePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        const parentDir = this.directories.get(FileUtils.getDirPath(standardizedFilePath));
        if (parentDir == null)
            throw new errors.FileNotFoundError(standardizedFilePath);

        const fileText = parentDir.files.get(standardizedFilePath);
        if (fileText === undefined)
            throw new errors.FileNotFoundError(standardizedFilePath);
        return fileText;
    }

    /** @inheritdoc */
    writeFile(filePath: string, fileText: string) {
        this.writeFileSync(filePath, fileText);
        return Promise.resolve();
    }

    /** @inheritdoc */
    writeFileSync(filePath: string, fileText: string) {
        this._writeFileSync(filePath, fileText);
    }

    /* @internal */
    private _writeFileSync(filePath: string, fileText: string) {
        // private method to avoid calling a method in the constructor that could be overwritten (virtual method)
        const standardizedFilePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        const dirPath = FileUtils.getDirPath(standardizedFilePath);
        this.getOrCreateDir(dirPath).files.set(standardizedFilePath, fileText);
    }

    /** @inheritdoc */
    mkdir(dirPath: string) {
        this.mkdirSync(dirPath);
        return Promise.resolve();
    }

    /** @inheritdoc */
    mkdirSync(dirPath: string) {
        this.getOrCreateDir(FileUtils.getStandardizedAbsolutePath(this, dirPath));
    }

    /** @inheritdoc */
    move(srcPath: string, destPath: string) {
        this.moveSync(srcPath, destPath);
        return Promise.resolve();
    }

    /** @inheritdoc */
    moveSync(srcPath: string, destPath: string) {
        const standardizedSrcPath = FileUtils.getStandardizedAbsolutePath(this, srcPath);
        const standardizedDestPath = FileUtils.getStandardizedAbsolutePath(this, destPath);

        if (this.fileExistsSync(standardizedSrcPath)) {
            const fileText = this.readFileSync(standardizedSrcPath);
            this.deleteSync(standardizedSrcPath);
            this.writeFileSync(standardizedDestPath, fileText);
        }
        else if (this.directories.has(standardizedSrcPath)) {
            const moveDirectory = (from: StandardizedFilePath, to: StandardizedFilePath) => {
                this._copyDirInternal(from, to);
                this.directories.delete(from);
            };
            moveDirectory(standardizedSrcPath, standardizedDestPath);

            // move descendant dirs
            for (const descendantDirPath of getDescendantDirectories(this.directories.keys(), standardizedSrcPath)) {
                const relativePath = FileUtils.getRelativePathTo(standardizedSrcPath, descendantDirPath);
                moveDirectory(descendantDirPath, FileUtils.pathJoin(standardizedDestPath, relativePath) as StandardizedFilePath);
            }
        }
        else {
            throw new errors.PathNotFoundError(standardizedSrcPath);
        }
    }

    /** @inheritdoc */
    copy(srcPath: string, destPath: string) {
        this.copySync(srcPath, destPath);
        return Promise.resolve();
    }

    /** @inheritdoc */
    copySync(srcPath: string, destPath: string) {
        const standardizedSrcPath = FileUtils.getStandardizedAbsolutePath(this, srcPath);
        const standardizedDestPath = FileUtils.getStandardizedAbsolutePath(this, destPath);

        if (this.fileExistsSync(standardizedSrcPath))
            this.writeFileSync(standardizedDestPath, this.readFileSync(standardizedSrcPath));
        else if (this.directories.has(standardizedSrcPath)) {
            this._copyDirInternal(standardizedSrcPath, standardizedDestPath);

            // copy descendant dirs
            for (const descendantDirPath of getDescendantDirectories(this.directories.keys(), standardizedSrcPath)) {
                const relativePath = FileUtils.getRelativePathTo(standardizedSrcPath, descendantDirPath);
                this._copyDirInternal(descendantDirPath, FileUtils.pathJoin(standardizedDestPath, relativePath) as StandardizedFilePath);
            }
        }
        else {
            throw new errors.PathNotFoundError(standardizedSrcPath);
        }
    }

    /** @internal */
    private _copyDirInternal(from: StandardizedFilePath, to: StandardizedFilePath) {
        const dir = this.directories.get(from)!;
        const newDir = this.getOrCreateDir(to);

        for (const [filePath, text] of dir.files.entries()) {
            const toDir = FileUtils.pathJoin(to, FileUtils.getBaseName(filePath)) as StandardizedFilePath;
            newDir.files.set(toDir, text);
        }
    }

    /** @inheritdoc */
    fileExists(filePath: string) {
        return Promise.resolve<boolean>(this.fileExistsSync(filePath));
    }

    /** @inheritdoc */
    fileExistsSync(filePath: string) {
        const standardizedFilePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        const dirPath = FileUtils.getDirPath(standardizedFilePath);
        const dir = this.directories.get(dirPath);
        if (dir == null)
            return false;

        return dir.files.has(standardizedFilePath);
    }

    /** @inheritdoc */
    directoryExists(dirPath: string) {
        return Promise.resolve<boolean>(this.directoryExistsSync(dirPath));
    }

    /** @inheritdoc */
    directoryExistsSync(dirPath: string): boolean {
        return this.directories.has(FileUtils.getStandardizedAbsolutePath(this, dirPath));
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
        const allFilePaths = Array.from(getAllFilePaths(this.directories.values()));
        return matchGlobs(allFilePaths, patterns, this.getCurrentDirectory());

        function* getAllFilePaths(directories: IterableIterator<VirtualDirectory>) {
            for (const dir of directories)
                yield* dir.files.keys();
        }
    }

    /** @internal */
    private getOrCreateDir(dirPath: StandardizedFilePath) {
        let dir = this.directories.get(dirPath);

        if (dir == null) {
            dir = { path: dirPath, files: new Map<StandardizedFilePath, string>() };
            this.directories.set(dirPath, dir);
            const parentDirPath = FileUtils.getDirPath(dirPath);
            if (parentDirPath !== dirPath)
                this.getOrCreateDir(parentDirPath);
        }

        return dir;
    }
}

function* getDescendantDirectories(directoryPaths: IterableIterator<StandardizedFilePath>, dirPath: StandardizedFilePath) {
    for (const path of directoryPaths) {
        if (FileUtils.pathStartsWith(path, dirPath))
            yield path;
    }
}
