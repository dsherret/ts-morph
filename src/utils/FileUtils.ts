import * as path from "path";
import {FileSystemHost} from "./../fileSystem";

export class FileUtils {
    private constructor() {
    }

    /**
     * Ensure the directory exists synchronously.
     * @param host - File system host.
     * @param dirPath - Directory path.
     */
    static ensureDirectoryExistsSync(host: FileSystemHost, dirPath: string) {
        if (host.directoryExistsSync(dirPath))
            return;

        // ensure the parent exists and is not the root
        const parentDirPath = path.dirname(dirPath);
        if (parentDirPath !== dirPath && path.dirname(parentDirPath) !== parentDirPath)
            FileUtils.ensureDirectoryExistsSync(host, parentDirPath);

        // make this directory
        host.mkdirSync(dirPath);
    }

    /**
     * Ensure the directory exists asynchronously.
     * @param host - File system host.
     * @param dirPath - Directory path.
     */
    static async ensureDirectoryExists(host: FileSystemHost, dirPath: string) {
        if (await host.directoryExists(dirPath))
            return;

        // ensure the parent exists and is not the root
        const parentDirPath = path.dirname(dirPath);
        if (parentDirPath !== dirPath && path.dirname(parentDirPath) !== parentDirPath)
            await FileUtils.ensureDirectoryExists(host, parentDirPath);

        // make this directory
        await host.mkdir(dirPath);
    }

    /**
     * Gets the current directory.
     */
    static getCurrentDirectory() {
        return FileUtils.getStandardizedAbsolutePath(path.resolve());
    }

    /**
     * Joins the paths.
     * @param paths - Paths to join.
     */
    static pathJoin(...paths: string[]) {
        return FileUtils.standardizeSlashes(path.join(...paths));
    }

    /**
     * Gets the standardized absolute path.
     * @param fileOrDirPath - Path to standardize.
     * @param relativeBase - Base path to be relative from.
     */
    static getStandardizedAbsolutePath(fileOrDirPath: string, relativeBase?: string) {
        if (relativeBase != null && !path.isAbsolute(fileOrDirPath))
            fileOrDirPath = path.join(relativeBase, fileOrDirPath);

        return FileUtils.standardizeSlashes(path.normalize(path.resolve(fileOrDirPath)));
    }

    /**
     * Gets the directory path.
     * @param fileOrDirPath - Path to get the directory name from.
     */
    static getDirPath(fileOrDirPath: string) {
        return path.dirname(fileOrDirPath);
    }

    /**
     * Gets the base name.
     * @param fileOrDirPath - Path to get the base name from.
     */
    static getBaseName(fileOrDirPath: string) {
        return path.basename(fileOrDirPath);
    }

    /**
     * Changes all back slashes to forward slashes.
     * @param fileOrDirPath - Path.
     */
    static standardizeSlashes(fileOrDirPath: string) {
        return fileOrDirPath.replace(/\\/g, "/");
    }

    /**
     * Checks if a file path matches a specified search string.
     * @param filePath - File path.
     * @param searchString - Search string.
     */
    static filePathMatches(filePath: string | null, searchString: string | null) {
        const splitBySlash = (p: string | null) => this.standardizeSlashes(p || "").replace(/^\//, "").split("/");

        const filePathItems = splitBySlash(filePath);
        const searchItems = splitBySlash(searchString);

        if (searchItems.length > filePathItems.length)
            return false;

        for (let i = 0; i < searchItems.length; i++) {
            if (searchItems[searchItems.length - i - 1] !== filePathItems[filePathItems.length - i - 1])
                return false;
        }

        return searchItems.length > 0;
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
            if (err.code !== "ENOENT") // file not found exception
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
            if (err.code !== "ENOENT") // file not found exception
                throw err;
            return false;
        }
    }
}
