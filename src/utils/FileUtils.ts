import * as toAbsoluteGlob from "@dsherret/to-absolute-glob";
import * as path from "path";
import { FileSystemHost, FileSystemWrapper } from "../fileSystem";
import { ArrayUtils } from "./ArrayUtils";
import { StringUtils } from "./StringUtils";
import globParent = require("glob-parent");
import isNegatedGlob = require("is-negated-glob");

export class FileUtils {
    private static standardizeSlashesRegex = /\\/g;
    private static trimSlashStartRegex = /^\//;
    private static trimSlashEndRegex = /\/$/;

    static readonly ENOENT = "ENOENT";

    private constructor() {
    }

    /**
     * Gets if the error is a file not found or directory not found error.
     * @param err - Error to check.
     */
    static isNotExistsError(err: any) {
        return err != null && err.code === FileUtils.ENOENT;
    }

    /**
     * Joins the paths.
     * @param paths - Paths to join.
     */
    static pathJoin(...paths: string[]) {
        return FileUtils.standardizeSlashes(path.join(...paths));
    }

    /**
     * Gets if the path is absolute.
     * @param fileOrDirPath - File or directory path.
     */
    static pathIsAbsolute(fileOrDirPath: string) {
        return path.isAbsolute(fileOrDirPath);
    }

    /**
     * Gets the standardized absolute path.
     * @param fileSystem - File system.
     * @param fileOrDirPath - Path to standardize.
     * @param relativeBase - Base path to be relative from.
     */
    static getStandardizedAbsolutePath(fileSystem: FileSystemHost, fileOrDirPath: string, relativeBase?: string) {
        return FileUtils.standardizeSlashes(path.normalize(getAbsolutePath()));

        function getAbsolutePath() {
            const isAbsolutePath = path.isAbsolute(fileOrDirPath);
            if (isAbsolutePath)
                return fileOrDirPath;
            if (!fileOrDirPath.startsWith("./") && relativeBase != null)
                return path.join(relativeBase, fileOrDirPath);
            return path.join(fileSystem.getCurrentDirectory(), fileOrDirPath);
        }
    }

    /**
     * Gets the directory path.
     * @param fileOrDirPath - Path to get the directory name from.
     */
    static getDirPath(fileOrDirPath: string) {
        return FileUtils.standardizeSlashes(path.dirname(fileOrDirPath));
    }

    /**
     * Gets the base name.
     * @param fileOrDirPath - Path to get the base name from.
     */
    static getBaseName(fileOrDirPath: string) {
        return path.basename(fileOrDirPath);
    }

    /**
     * Gets the extension of the file name.
     * @param fileOrDirPath - Path to get the extension from.
     */
    static getExtension(fileOrDirPath: string) {
        const baseName = FileUtils.getBaseName(fileOrDirPath);
        const lastDotIndex = baseName.lastIndexOf(".");
        if (lastDotIndex <= 0) // for files like .gitignore, need to include 0
            return ""; // same behaviour as node
        const lastExt = baseName.substring(lastDotIndex);
        const lastExtLowerCase = lastExt.toLowerCase();
        if (lastExtLowerCase === ".ts" && baseName.substring(lastDotIndex - 2, lastDotIndex).toLowerCase() === ".d")
            return baseName.substring(lastDotIndex - 2);
        if (lastExtLowerCase === ".map" && baseName.substring(lastDotIndex - 3, lastDotIndex).toLowerCase() === ".js")
            return baseName.substring(lastDotIndex - 3);
        return lastExt;
    }

    /**
     * Changes all back slashes to forward slashes.
     * @param fileOrDirPath - Path.
     */
    static standardizeSlashes(fileOrDirPath: string) {
        return fileOrDirPath.replace(this.standardizeSlashesRegex, "/");
    }

    /**
     * Checks if a path ends with a specified search path.
     * @param fileOrDirPath - Path.
     * @param endsWithPath - Ends with path.
     */
    static pathEndsWith(fileOrDirPath: string | undefined, endsWithPath: string | undefined) {
        const pathItems = FileUtils.splitPathBySlashes(fileOrDirPath);
        const endsWithItems = FileUtils.splitPathBySlashes(endsWithPath);

        if (endsWithItems.length > pathItems.length)
            return false;

        for (let i = 0; i < endsWithItems.length; i++) {
            if (endsWithItems[endsWithItems.length - i - 1] !== pathItems[pathItems.length - i - 1])
                return false;
        }

        return endsWithItems.length > 0;
    }

    /**
     * Checks if a path starts with a specified search path.
     * @param fileOrDirPath - Path.
     * @param startsWithPath - Starts with path.
     */
    static pathStartsWith(fileOrDirPath: string | undefined, startsWithPath: string | undefined) {
        const isfileOrDirPathEmpty = StringUtils.isNullOrWhitespace(fileOrDirPath);
        const isStartsWithPathEmpty = StringUtils.isNullOrWhitespace(startsWithPath);
        const pathItems = FileUtils.splitPathBySlashes(fileOrDirPath);
        const startsWithItems = FileUtils.splitPathBySlashes(startsWithPath);

        if (isfileOrDirPathEmpty && isStartsWithPathEmpty)
            return true;

        if (isStartsWithPathEmpty || startsWithItems.length > pathItems.length)
            return false;

        // return true for the root directory
        if (startsWithItems.length === 1 && startsWithItems[0].length === 0)
            return true;

        for (let i = 0; i < startsWithItems.length; i++) {
            if (startsWithItems[i] !== pathItems[i])
                return false;
        }

        return startsWithItems.length > 0;
    }

    private static splitPathBySlashes(fileOrDirPath: string | undefined) {
        fileOrDirPath = (fileOrDirPath || "").replace(FileUtils.trimSlashStartRegex, "").replace(FileUtils.trimSlashEndRegex, "");
        return FileUtils.standardizeSlashes(fileOrDirPath).replace(/^\//, "").split("/");
    }

    /**
     * Gets the parent most paths out of the list of paths.
     * @param paths - File or directory paths.
     */
    static getParentMostPaths(paths: string[]) {
        const finalPaths: string[] = [];

        for (const fileOrDirPath of ArrayUtils.sortByProperty(paths, p => p.length)) {
            if (finalPaths.every(p => !FileUtils.pathStartsWith(fileOrDirPath, p)))
                finalPaths.push(fileOrDirPath);
        }

        return finalPaths;
    }

    /**
     * Reads a file or returns false if the file doesn't exist.
     * @param fileSystem - File System.
     * @param filePath - Path to file.
     * @param encoding - File encoding.
     */
    static async readFileOrNotExists(fileSystem: FileSystemHost, filePath: string, encoding: string) {
        try {
            return await fileSystem.readFile(filePath, encoding);
        } catch (err) {
            if (!FileUtils.isNotExistsError(err))
                throw err;
            return false;
        }
    }

    /**
     * Reads a file synchronously or returns false if the file doesn't exist.
     * @param fileSystem - File System.
     * @param filePath - Path to file.
     * @param encoding - File encoding.
     */
    static readFileOrNotExistsSync(fileSystem: FileSystemHost, filePath: string, encoding: string) {
        try {
            return fileSystem.readFileSync(filePath, encoding);
        } catch (err) {
            if (!FileUtils.isNotExistsError(err))
                throw err;
            return false;
        }
    }

    /**
     * Gets the text with a byte order mark.
     * @param text - Text.
     */
    static getTextWithByteOrderMark(text: string) {
        if (StringUtils.hasBom(text))
            return text;
        return "\uFEFF" + text;
    }

    /**
     * Gets the relative path from one absolute path to another.
     * @param absoluteDirPathFrom - Absolute directory path from.
     * @param absolutePathTo - Absolute path to.
     */
    static getRelativePathTo(absoluteDirPathFrom: string, absolutePathTo: string) {
        const relativePath = path.relative(absoluteDirPathFrom, path.dirname(absolutePathTo));
        return FileUtils.standardizeSlashes(path.join(relativePath, path.basename(absolutePathTo)));
    }

    /**
     * Gets if the path is for the root directory.
     * @param path - Path.
     */
    static isRootDirPath(dirOrFilePath: string) {
        return dirOrFilePath === FileUtils.getDirPath(dirOrFilePath);
    }

    /**
     * Gets the descendant directories of the specified directory.
     * @param dirPath - Directory path.
     */
    static getDescendantDirectories(fileSystemWrapper: FileSystemWrapper, dirPath: string) {
        // todo: unit tests...
        return Array.from(getDescendantDirectories(dirPath));

        function* getDescendantDirectories(currentDirPath: string): IterableIterator<string> {
            const subDirPaths = fileSystemWrapper.readDirSync(currentDirPath).filter(d => fileSystemWrapper.directoryExistsSync(d));
            for (const subDirPath of subDirPaths) {
                yield subDirPath;
                yield* getDescendantDirectories(subDirPath);
            }
        }
    }

    /**
     * Gets the glob as absolute.
     * @param glob - Glob.
     * @param cwd - Current working directory.
     */
    static toAbsoluteGlob(glob: string, cwd: string) {
        return toAbsoluteGlob(glob, { cwd });
    }

    /**
     * Gets if the glob is a negated glob.
     * @param glob - Glob.
     */
    static isNegatedGlob(glob: string) {
        return isNegatedGlob(glob).negated;
    }

    /**
     * Gets the glob's directory.
     * @param glob - Glob.
     */
    static getGlobDir(glob: string) {
        return globParent(glob);
    }
}
