/* barrel:ignore */
import { SourceFile } from "../compiler";
import { Directory } from "../fileSystem/Directory";
import { ProjectContext } from "../ProjectContext";
import { ArrayUtils, FileUtils, KeyValueCache, SortedKeyValueArray, LocaleStringComparer } from "../utils";

/**
 * Cache for the directories.
 * @internal
 */
export class DirectoryCache {
    private readonly directoriesByPath = new KeyValueCache<string, Directory>();
    private readonly sourceFilesByDirPath = new KeyValueCache<string, SortedKeyValueArray<string, SourceFile>>();
    private readonly directoriesByDirPath = new KeyValueCache<string, SortedKeyValueArray<string, Directory>>();
    private readonly orphanDirs = new KeyValueCache<string, Directory>();

    constructor(private readonly context: ProjectContext) {
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
        this.directoriesByPath.removeByKey(dirPath);
        this.orphanDirs.removeByKey(dirPath);
    }

    getChildDirectoriesOfDirectory(dirPath: string) {
        const directories = this.directoriesByDirPath.get(dirPath);
        if (directories == null)
            return [];
        return directories.getArrayCopy();
    }

    getChildSourceFilesOfDirectory(dirPath: string) {
        const sourceFiles = this.sourceFilesByDirPath.get(dirPath);
        if (sourceFiles == null)
            return [];
        return sourceFiles.getArrayCopy();
    }

    addSourceFile(sourceFile: SourceFile) {
        const dirPath = sourceFile.getDirectoryPath();
        this.createOrAddIfExists(dirPath);
        const sourceFiles = this.sourceFilesByDirPath.getOrCreate(dirPath,
            () => new SortedKeyValueArray<string, SourceFile>(item => item.getBaseName(), LocaleStringComparer.instance));
        sourceFiles.set(sourceFile);
    }

    removeSourceFile(filePath: string) {
        const dirPath = FileUtils.getDirPath(filePath);
        const sourceFiles = this.sourceFilesByDirPath.get(dirPath);
        if (sourceFiles == null)
            return;
        sourceFiles.removeByKey(FileUtils.getBaseName(filePath));

        // clean up
        if (!sourceFiles.hasItems())
            this.sourceFilesByDirPath.removeByKey(dirPath);
    }

    createOrAddIfExists(dirPath: string): Directory {
        if (this.has(dirPath))
            return this.get(dirPath)!;

        this.fillParentsOfDirPath(dirPath);
        return this.createDirectory(dirPath);
    }

    private createDirectory(path: string) {
        const newDirectory = new Directory(this.context, path);
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
        if (!this.context.fileSystemWrapper.directoryExistsSync(path))
            this.context.fileSystemWrapper.queueMkdir(path);

        for (const orphanDir of this.orphanDirs.getValues()) {
            if (directory.isAncestorOf(orphanDir))
                this.fillParentsOfDirPath(orphanDir.getPath());
        }
    }

    private addToDirectoriesByDirPath(directory: Directory) {
        if (FileUtils.isRootDirPath(directory.getPath()))
            return;
        const parentDirPath = FileUtils.getDirPath(directory.getPath());
        const directories = this.directoriesByDirPath.getOrCreate(parentDirPath,
            () => new SortedKeyValueArray<string, Directory>(item => item.getBaseName(), LocaleStringComparer.instance));
        directories.set(directory);
    }

    private removeFromDirectoriesByDirPath(dirPath: string) {
        if (FileUtils.isRootDirPath(dirPath))
            return;
        const parentDirPath = FileUtils.getDirPath(dirPath);
        const directories = this.directoriesByDirPath.get(parentDirPath);
        if (directories == null)
            return;
        directories.removeByKey(FileUtils.getBaseName(dirPath));

        // clean up
        if (!directories.hasItems())
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
