import * as errors from "../errors";
import { SourceFile } from "../compiler";
import { CompilerFactory } from "../factories";
import { FileUtils } from "../utils";
import { DirectoryAddOptions } from "./Directory";
import { FileSystemWrapper } from "./FileSystemWrapper";

/**
 * Contains common methods between Project and Directory.
 *
 * I'll definitely need to refactor this in the future... just putting these methods in a common place for now.
 */
export class DirectoryCoordinator {
    constructor(private readonly compilerFactory: CompilerFactory, private readonly fileSystemWrapper: FileSystemWrapper) {
    }

    addExistingDirectoryIfExists(dirPath: string, options: DirectoryAddOptions) {
        const directory = this.compilerFactory.getDirectoryFromPath(dirPath);
        if (directory == null)
            return undefined;

        if (options.recursive) {
            for (const descendantDirPath of FileUtils.getDescendantDirectories(this.fileSystemWrapper, dirPath))
                this.compilerFactory.createDirectoryOrAddIfExists(descendantDirPath);
        }

        return directory;
    }

    addExistingDirectory(dirPath: string, options: DirectoryAddOptions) {
        const directory = this.addExistingDirectoryIfExists(dirPath, options);
        if (directory == null)
            throw new errors.DirectoryNotFoundError(dirPath);
        return directory;
    }

    createDirectoryOrAddIfExists(dirPath: string) {
        return this.compilerFactory.createDirectoryOrAddIfExists(dirPath);
    }

    addExistingSourceFileIfExists(filePath: string): SourceFile | undefined {
        return this.compilerFactory.addOrGetSourceFileFromFilePath(filePath);
    }

    addExistingSourceFile(filePath: string): SourceFile {
        const sourceFile = this.addExistingSourceFileIfExists(filePath);
        if (sourceFile == null)
            throw new errors.FileNotFoundError(this.fileSystemWrapper.getStandardizedAbsolutePath(filePath));
        return sourceFile;
    }

    addExistingSourceFiles(fileGlobs: string | string[]): SourceFile[] {
        if (typeof fileGlobs === "string")
            fileGlobs = [fileGlobs];

        const sourceFiles: SourceFile[] = [];
        const globbedDirectories = FileUtils.getParentMostPaths(fileGlobs.filter(g => !FileUtils.isNegatedGlob(g)).map(g => FileUtils.getGlobDir(g)));

        for (const filePath of this.fileSystemWrapper.glob(fileGlobs)) {
            const sourceFile = this.addExistingSourceFileIfExists(filePath);
            if (sourceFile != null)
                sourceFiles.push(sourceFile);
        }

        for (const dirPath of globbedDirectories)
            this.addExistingDirectoryIfExists(dirPath, { recursive: true });

        return sourceFiles;
    }
}
