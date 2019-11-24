import { ts, ScriptKind } from "../typescript";
import { StandardizedFilePath } from "../fileSystem";

/**
 * A container of source files.
 */
export interface TsSourceFileContainer {
    /**
     * Gets if a source file exists at the specified file path.
     * @param filePath - File path to check.
     */
    containsSourceFileAtPath(filePath: StandardizedFilePath): boolean;
    /**
     * Gets the source file paths of all the source files in the container.
     */
    getSourceFilePaths(): Iterable<StandardizedFilePath>;
    /**
     * Gets a source file from a file path, but only if it exists in the container's cache.
     * @param filePath - File path to get the source file from.
     */
    getSourceFileFromCacheFromFilePath(filePath: StandardizedFilePath): ts.SourceFile | undefined;
    /**
     * Adds or gets a source file from a file path.
     * @param filePath - File path to get.
     * @param opts - Options for adding or getting the file.
     */
    addOrGetSourceFileFromFilePath(filePath: StandardizedFilePath, opts: { markInProject: boolean; scriptKind: ScriptKind | undefined; }): ts.SourceFile
        | undefined;
    /**
     * Gets the source file version of the specified source file.
     * @param sourceFile - Source file to inspect.
     */
    getSourceFileVersion(sourceFile: ts.SourceFile): string;
    /**
     * Gets if the container contains the specified directory.
     * @param dirPath - Path of the directory to check.
     */
    containsDirectoryAtPath(dirPath: StandardizedFilePath): boolean;
    /**
     * Gets the child directories of the specified directory.
     * @param dirPath - Path of the directory to check.
     */
    getChildDirectoriesOfDirectory(dirPath: StandardizedFilePath): StandardizedFilePath[];
}
