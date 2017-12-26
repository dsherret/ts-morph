import * as errors from "./../errors";
import {KeyValueCache, FileUtils, createHashSet, StringUtils, ArrayUtils} from "./../utils";
import {Minimatch} from "minimatch";
import {FileSystemHost} from "./FileSystemHost";

export class VirtualFileSystemHost implements FileSystemHost {
    private readonly files = new KeyValueCache<string, string>();
    private readonly directories = createHashSet<string>();

    constructor() {
        this.directories.add("/");
    }

    delete(path: string) {
        this.deleteSync(path);
        return Promise.resolve();
    }

    deleteSync(path: string) {
        path = FileUtils.getStandardizedAbsolutePath(this, path);
        if (this.directories.has(path)) {
            for (const filePath of ArrayUtils.from(this.files.getKeys())) {
                if (StringUtils.startsWith(filePath, path))
                    this.files.removeByKey(filePath);
            }
            for (const directoryPath of ArrayUtils.from(this.directories.values())) {
                if (StringUtils.startsWith(directoryPath, path))
                    this.directories.delete(directoryPath);
            }
        }
        else
            this.files.removeByKey(path);
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
        const fileText = this.files.get(filePath);
        if (fileText == null)
            throw new errors.FileNotFoundError(filePath);
        return fileText;
    }

    writeFile(filePath: string, fileText: string) {
        this.writeFileSync(filePath, fileText);
        return Promise.resolve();
    }

    writeFileSync(filePath: string, fileText: string) {
        filePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        FileUtils.ensureDirectoryExistsSync(this, FileUtils.getDirPath(filePath));
        this.files.set(filePath, fileText);
    }

    mkdir(dirPath: string) {
        this.mkdirSync(dirPath);
        return Promise.resolve();
    }

    mkdirSync(dirPath: string) {
        dirPath = FileUtils.getStandardizedAbsolutePath(this, dirPath);
        if (dirPath !== FileUtils.getDirPath(dirPath))
            FileUtils.ensureDirectoryExistsSync(this, FileUtils.getDirPath(dirPath));
        this.directories.add(dirPath);
    }

    fileExists(filePath: string) {
        return Promise.resolve<boolean>(this.fileExistsSync(filePath));
    }

    fileExistsSync(filePath: string) {
        filePath = FileUtils.getStandardizedAbsolutePath(this, filePath);
        return this.files.has(filePath);
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

        for (const pattern of patterns) {
            const mm = new Minimatch(pattern, { matchBase: true });
            for (const filePath of this.files.getKeys()) {
                if (mm.match(filePath))
                    filePaths.push(filePath);
            }
        }

        return filePaths;
    }
}
