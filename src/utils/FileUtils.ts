import * as path from "path";

export class FileUtils {
    private constructor() {
    }

    /**
     * Gets the current directory.
     */
    static getCurrentDirectory() {
        return this.getStandardizedAbsolutePath(path.resolve());
    }

    /**
     * Joins the paths.
     * @param paths - Paths to join.
     */
    static pathJoin(...paths: string[]) {
        return path.join(...paths);
    }

    /**
     * Gets the standardized absolute path.
     * @param fileOrDirPath - Path to standardize.
     */
    static getStandardizedAbsolutePath(fileOrDirPath: string) {
        return this.standardizeSlashes(path.normalize(path.resolve(fileOrDirPath)));
    }

    /**
     * Gets the directory name.
     * @param fileOrDirPath - Path to get the directory name from.
     */
    static getDirName(fileOrDirPath: string) {
        return path.dirname(fileOrDirPath);
    }

    /**
     * Gets the absolute path when absolute, otherwise gets the relative path from the base dir.
     * @param filePath - File path.
     * @param baseDir - Base dir to use when file path is relative.
     */
    static getAbsoluteOrRelativePathFromPath(filePath: string, baseDir: string) {
        if (path.isAbsolute(filePath))
            return FileUtils.getStandardizedAbsolutePath(filePath);

        return FileUtils.getStandardizedAbsolutePath(path.join(baseDir, filePath));
    }

    static standardizeSlashes(fileName: string) {
        return fileName.replace(/\\/g, "/");
    }

    static filePathMatches(fileName: string | null, searchString: string | null) {
        const splitBySlash = (p: string | null) => this.standardizeSlashes(p || "").replace(/^\//, "").split("/");

        const fileNameItems = splitBySlash(fileName);
        const searchItems = splitBySlash(searchString);

        if (searchItems.length > fileNameItems.length)
            return false;

        for (let i = 0; i < searchItems.length; i++) {
            if (searchItems[searchItems.length - i - 1] !== fileNameItems[fileNameItems.length - i - 1])
                return false;
        }

        return searchItems.length > 0;
    }
}
