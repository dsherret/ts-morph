/* barrel:ignore */
import { GlobalContainer } from "../GlobalContainer";
import { KeyValueCache, ArrayUtils, FileUtils } from "../utils";
import { SourceFile } from "../compiler";
import { Directory } from "../fileSystem/Directory";

/**
 * Cache for the directories.
 * @internal
 */
export class DirectoryCache {
    private readonly directoriesByPath = new KeyValueCache<string, Directory>();
    private readonly sourceFilesByDirPath = new KeyValueCache<string, SourceFile[]>();
    private readonly directoriesByDirPath = new KeyValueCache<string, Directory[]>();
    private readonly orphanDirs = new KeyValueCache<string, Directory>();

    constructor(private readonly global: GlobalContainer) {
    }

    has(dirPath: string) {
        return this.directoriesByPath.has(dirPath);
    }

    get(dirPath: string) {
        if (!this.directoriesByPath.has(dirPath)) {
            for (const orphanDir of this.orphanDirs.getValues()) {
                if (FileUtils.pathStartsWith(orphanDir.getPath(), dirPath))
                    return this.createOrAddIfExists(dirPath);
            }
            return undefined;
        }
        return this.directoriesByPath.get(dirPath);
    }

    getOrphans() {
        return this.orphanDirs.getValuesAsArray();
    }

    getAll() {
        return this.directoriesByPath.getValuesAsArray();
    }

    *getAllByDepth() {
        const dirLevels = new KeyValueCache<number, Directory[]>();
        let depth = 0;
        this.getOrphans().forEach(addToDirLevels);
        depth = Math.min(...ArrayUtils.from(dirLevels.getKeys()));

        while (dirLevels.getSize() > 0) {
            for (const dir of dirLevels.get(depth) || []) {
                yield dir;
                dir.getDirectories().forEach(addToDirLevels);
            }
            dirLevels.removeByKey(depth);
            depth++;
        }

        function addToDirLevels(dir: Directory) {
            const dirDepth = dir.getDepth();

            /* istanbul ignore if */
            if (depth > dirDepth)
                throw new Error(`For some reason a subdirectory had a lower depth than the parent directory: ${dir.getPath()}`);

            const dirs = dirLevels.getOrCreate<Directory[]>(dirDepth, () => []);
            dirs.push(dir);
        }
    }

    remove(dirPath: string) {
        this.removeFromDirectoriesByDirPath(dirPath);
        return this.directoriesByPath.removeByKey(dirPath) || this.orphanDirs.removeByKey(dirPath);
    }

    getChildDirectoriesOfDirectory(dirPath: string) {
        const directories = this.directoriesByDirPath.get(dirPath);
        if (directories == null)
            return [];
        return [...directories];
    }

    getChildSourceFilesOfDirectory(dirPath: string) {
        const sourceFiles = this.sourceFilesByDirPath.get(dirPath);
        if (sourceFiles == null)
            return [];
        return [...sourceFiles];
    }

    addSourceFile(sourceFile: SourceFile) {
        const dirPath = sourceFile.getDirectoryPath();
        this.createOrAddIfExists(dirPath);
        const sourceFiles = this.sourceFilesByDirPath.getOrCreate(dirPath, () => []);
        const baseName = sourceFile.getBaseName().toUpperCase();
        ArrayUtils.binaryInsert(sourceFiles, sourceFile, item => item.getBaseName().toUpperCase() > baseName);
    }

    removeSourceFile(filePath: string) {
        const dirPath = FileUtils.getDirPath(filePath);
        const sourceFiles = this.sourceFilesByDirPath.get(dirPath);
        if (sourceFiles == null)
            return;
        const baseName = FileUtils.getBaseName(filePath).toUpperCase();
        const index = ArrayUtils.binarySearch(sourceFiles, item => item.getFilePath() === filePath, item => item.getBaseName().toUpperCase() > baseName);

        if (index >= 0)
            sourceFiles.splice(index, 1);

        // clean up
        if (sourceFiles.length === 0)
            this.sourceFilesByDirPath.removeByKey(dirPath);
    }

    createOrAddIfExists(dirPath: string): Directory {
        if (this.has(dirPath))
            return this.get(dirPath)!;

        this.fillParentsOfDirPath(dirPath);
        return this.createDirectory(dirPath);
    }

    private createDirectory(path: string) {
        const newDirectory = new Directory(this.global, path);
        this.addDirectory(newDirectory);
        return newDirectory;
    }

    addDirectory(directory: Directory) {
        const path = directory.getPath();
        const parentDirPath = FileUtils.getDirPath(path);
        const isRootDir = parentDirPath === path;

        // remove any orphans that have a loaded parent
        for (const orphanDir of this.orphanDirs.getValues()) {
            const orphanDirPath = orphanDir.getPath();
            const orphanDirParentPath = FileUtils.getDirPath(orphanDirPath);
            const isOrphanRootDir = orphanDirParentPath === orphanDirPath;
            if (!isOrphanRootDir && orphanDirParentPath === path)
                this.orphanDirs.removeByKey(orphanDirPath);
        }

        if (!isRootDir)
            this.addToDirectoriesByDirPath(directory);

        if (!this.has(parentDirPath))
            this.orphanDirs.set(path, directory);

        this.directoriesByPath.set(path, directory);
        this.global.fileSystemWrapper.dequeueDelete(path);

        for (const orphanDir of this.orphanDirs.getValues()) {
            if (directory.isAncestorOf(orphanDir))
                this.fillParentsOfDirPath(orphanDir.getPath());
        }
    }

    private addToDirectoriesByDirPath(directory: Directory) {
        if (FileUtils.isRootDirPath(directory.getPath()))
            return;
        const parentDirPath = FileUtils.getDirPath(directory.getPath());
        const directories = this.directoriesByDirPath.getOrCreate(parentDirPath, () => []);
        const baseName = directory.getBaseName().toUpperCase();
        ArrayUtils.binaryInsert(directories, directory, item => item.getBaseName().toUpperCase() > baseName);
    }

    private removeFromDirectoriesByDirPath(dirPath: string) {
        if (FileUtils.isRootDirPath(dirPath))
            return;
        const parentDirPath = FileUtils.getDirPath(dirPath);
        const directories = this.directoriesByDirPath.get(parentDirPath);
        if (directories == null)
            return;
        const baseName = FileUtils.getBaseName(dirPath).toUpperCase();
        const index = ArrayUtils.binarySearch(directories, item => item.getPath() === dirPath, item => item.getBaseName().toUpperCase() > baseName);
        if (index >= 0)
            directories.splice(index, 1);

        // clean up
        if (directories.length === 0)
            this.directoriesByDirPath.removeByKey(parentDirPath);
    }

    private fillParentsOfDirPath(dirPath: string) {
        const passedDirPaths: string[] = [];
        let dir = dirPath;
        let parentDir = FileUtils.getDirPath(dir);
        while (dir !== parentDir) {
            dir = parentDir;
            parentDir = FileUtils.getDirPath(dir);
            if (this.directoriesByPath.has(dir)) {
                for (const currentDirPath of passedDirPaths)
                    this.createDirectory(currentDirPath);
                break;
            }

            passedDirPaths.unshift(dir);
        }
    }
}
