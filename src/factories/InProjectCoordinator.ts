import { SourceFile } from "../compiler";
import { Directory } from "../fileSystem";
import { CompilerFactory } from "./CompilerFactory";
import { ArrayUtils, FileUtils, createHashSet } from "../utils";

/**
 * Holds information about whether source files or directories are in the project.
 *
 * todo: Move this to a different folder.
 */
export class InProjectCoordinator {
    private readonly notInProjectFiles = createHashSet<SourceFile>();

    constructor(private readonly compilerFactory: CompilerFactory) {
        compilerFactory.onSourceFileRemoved(sourceFile => {
            this.notInProjectFiles.delete(sourceFile);
        });
    }

    /** Sets the source file as not being in the project. */
    setSourceFileNotInProject(sourceFile: SourceFile) {
        this.notInProjectFiles.add(sourceFile);
        (sourceFile as any)._inProject = false;
    }

    /** Marks the specified source file being included in the project. */
    markSourceFileAsInProject(sourceFile: SourceFile) {
        if (this.isSourceFileInProject(sourceFile))
            return;

        this._internalMarkSourceFileAsInProject(sourceFile);
        this.notInProjectFiles.delete(sourceFile);
    }

    /** Marks all the source files as being in the project. */
    markAllSourceFilesAsInProject() {
        for (const sourceFile of this.notInProjectFiles.values())
            this._internalMarkSourceFileAsInProject(sourceFile);
        this.notInProjectFiles.clear();
    }

    private _internalMarkSourceFileAsInProject(sourceFile: SourceFile) {
        (sourceFile as any)._inProject = true;
        this.markDirectoryAsInProject(sourceFile.getDirectory());
    }

    /** Checks if the specified source file is in the project. */
    isSourceFileInProject(sourceFile: SourceFile) {
        return (sourceFile as any)._inProject === true;
    }

    /** Sets the directory and files as not being in the project for testing. */
    setDirectoryAndFilesAsNotInProjectForTesting(directory: Directory) {
        for (const subDir of directory.getDirectories())
            this.setDirectoryAndFilesAsNotInProjectForTesting(subDir);

        for (const file of directory.getSourceFiles()) {
            delete (file as any)._inProject;
            this.notInProjectFiles.add(file);
        }

        delete (directory as any)._inProject;
    }

    /** Marks the specified directory as being in the project. */
    markDirectoryAsInProject(directory: Directory) {
        if (this.isDirectoryInProject(directory))
            return;

        const inProjectCoordinator = this;
        const compilerFactory = this.compilerFactory;
        (directory as any)._inProject = true;
        markAncestorDirs(directory);

        function markAncestorDirs(dir: Directory) {
            const ancestorDirs = ArrayUtils.from(getAncestorsUpToOneInProject(dir));

            // only mark the ancestor directories as being in the project if the top one is in the project
            const topAncestor = ancestorDirs[ancestorDirs.length - 1];
            if (topAncestor == null || !inProjectCoordinator.isDirectoryInProject(topAncestor))
                return;

            for (const ancestorDir of ancestorDirs)
                (ancestorDir as any)._inProject = true;
        }

        function *getAncestorsUpToOneInProject(dir: Directory): IterableIterator<Directory> {
            if (FileUtils.isRootDirPath(dir.getPath()))
                return;
            const parentDirPath = FileUtils.getDirPath(dir.getPath());
            const parentDir = compilerFactory.getDirectoryFromCacheOnlyIfInCache(parentDirPath);
            if (parentDir == null)
                return;

            yield parentDir;

            if (!inProjectCoordinator.isDirectoryInProject(parentDir))
                yield* getAncestorsUpToOneInProject(parentDir);
        }
    }

    /** Checks if the specified directory is in the project. */
    isDirectoryInProject(directory: Directory) {
        return (directory as any)._inProject === true;
    }
}
