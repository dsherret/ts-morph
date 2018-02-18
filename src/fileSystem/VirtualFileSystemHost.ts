import * as errors from "./../errors";
import {KeyValueCache, FileUtils, StringUtils, ArrayUtils} from "./../utils";
import * as multimatch from "multimatch";
import {FileSystemHost} from "./FileSystemHost";

interface VirtualDirectory {
    path: string;
    files: KeyValueCache<string, string>;
}

export class VirtualFileSystemHost implements FileSystemHost {
    private readonly directories = new KeyValueCache<string, VirtualDirectory>();

    constructor() {
        this.getOrCreateDir("/");
    }

    delete(path: string) {
        try {
            this.deleteSync(path);
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        }
    }

    deleteSync(path: string) {
        path = FileUtils.getStandardizedAbsolutePath(this, path);
        if (this.directories.has(path)) {
            // remove descendant dirs
            for (const directoryPath of ArrayUtils.from(this.directories.getKeys())) {
                if (StringUtils.startsWith(directoryPath, path))
                    this.directories.removeByKey(directoryPath);
            }
            // remove this dir
            this.directories.removeByKey(path);
            return;
        }

        const parentDir = this.directories.get(FileUtils.getDirPath(path));
        if (parentDir == null || !parentDir.files.has(path))
            throw new errors.FileNotFoundError(path);
        parentDir.files.removeByKey(path);
    }

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

    readFile(filePath: string, encoding = "utf-8") {
        try {
            return Promise.resolve(this.readFileSync(filePath, encoding));
        } catch (err) {
            return Promise.reject(err);
        }
    }

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

    writeFile(filePath: string, fileText: string) {
        this.writeFileSync(filePath, fileText);
        return Promise.resolve();
    }

    writeFileSync(filePath: string, fileText: string) {
        filePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        const dirPath = FileUtils.getDirPath(filePath);
        this.getOrCreateDir(dirPath).files.set(filePath, fileText);
    }

    mkdir(dirPath: string) {
        this.mkdirSync(dirPath);
        return Promise.resolve();
    }

    mkdirSync(dirPath: string) {
        dirPath = FileUtils.getStandardizedAbsolutePath(this, dirPath);
        this.getOrCreateDir(dirPath);
    }

    fileExists(filePath: string) {
        return Promise.resolve<boolean>(this.fileExistsSync(filePath));
    }

    fileExistsSync(filePath: string) {
        filePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        const dirPath = FileUtils.getDirPath(filePath);
        const dir = this.directories.get(dirPath);
        if (dir == null)
            return false;

        return dir.files.has(filePath);
    }

    directoryExists(dirPath: string) {
        return Promise.resolve<boolean>(this.directoryExistsSync(dirPath));
    }

    directoryExistsSync(dirPath: string) {
        dirPath = FileUtils.getStandardizedAbsolutePath(this, dirPath);
        return this.directories.has(dirPath);
    }

    getCurrentDirectory() {
        return "/";
    }

    glob(patterns: string[]): string[] {
        const filePaths: string[] = [];

        const allFilePaths = ArrayUtils.from(getAllFilePaths(this.directories.getValues()));
        return multimatch(allFilePaths, patterns);

        function* getAllFilePaths(directories: IterableIterator<VirtualDirectory>) {
            for (const dir of directories) {
                yield* dir.files.getKeys();
            }
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
