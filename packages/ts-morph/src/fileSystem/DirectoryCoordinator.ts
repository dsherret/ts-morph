import { errors, FileUtils, TransactionalFileSystem } from "@ts-morph/common";
import { SourceFile } from "../compiler";
import { CompilerFactory } from "../factories";
import { DirectoryAddOptions } from "./Directory";

/**
 * Contains common methods between Project and Directory.
 *
 * I'll definitely need to refactor this in the future... just putting these methods in a common place for now.
 */
export class DirectoryCoordinator {
    constructor(private readonly compilerFactory: CompilerFactory, private readonly fileSystemWrapper: TransactionalFileSystem) {
    }

    addExistingDirectoryIfExists(dirPath: string, options: DirectoryAddOptions & { markInProject: boolean; }) {
        const directory = this.compilerFactory.getDirectoryFromPath(dirPath, options);
        if (directory == null)
            return undefined;

        if (options.recursive) {
            for (const descendantDirPath of FileUtils.getDescendantDirectories(this.fileSystemWrapper, dirPath))
                this.compilerFactory.createDirectoryOrAddIfExists(descendantDirPath, options);
        }

        return directory;
    }

    addExistingDirectory(dirPath: string, options: DirectoryAddOptions & { markInProject: boolean; }) {
        const directory = this.addExistingDirectoryIfExists(dirPath, options);
        if (directory == null)
            throw new errors.DirectoryNotFoundError(dirPath);
        return directory;
    }

    createDirectoryOrAddIfExists(dirPath: string, options: { markInProject: boolean; }) {
        return this.compilerFactory.createDirectoryOrAddIfExists(dirPath, options);
    }

    addSourceFileAtPathIfExists(filePath: string, options: { markInProject: boolean; }): SourceFile | undefined {
        return this.compilerFactory.addOrGetSourceFileFromFilePath(filePath, {
            markInProject: options.markInProject,
            scriptKind: undefined
        });
    }

    addSourceFileAtPath(filePath: string, options: { markInProject: boolean; }): SourceFile {
        const sourceFile = this.addSourceFileAtPathIfExists(filePath, options);
        if (sourceFile == null)
            throw new errors.FileNotFoundError(this.fileSystemWrapper.getStandardizedAbsolutePath(filePath));
        return sourceFile;
    }

    addSourceFilesAtPaths(fileGlobs: string | ReadonlyArray<string>, options: { markInProject: boolean; }): SourceFile[] {
        if (typeof fileGlobs === "string")
            fileGlobs = [fileGlobs];

        const sourceFiles: SourceFile[] = [];
        const globbedDirectories = FileUtils.getParentMostPaths(fileGlobs.filter(g => !FileUtils.isNegatedGlob(g)).map(g => FileUtils.getGlobDir(g)));

        for (const filePath of this.fileSystemWrapper.glob(fileGlobs)) {
            const sourceFile = this.addSourceFileAtPathIfExists(filePath, options);
            if (sourceFile != null)
                sourceFiles.push(sourceFile);
        }

        for (const dirPath of globbedDirectories)
            this.addExistingDirectoryIfExists(dirPath, { recursive: true, markInProject: options.markInProject });

        return sourceFiles;
    }
}
