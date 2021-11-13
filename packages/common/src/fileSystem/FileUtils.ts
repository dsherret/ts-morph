import { runtime } from "../runtimes";
import { ArrayUtils, StringUtils } from "../utils";
import { FileSystemHost } from "./FileSystemHost";
import { StandardizedFilePath } from "./StandardizedFilePath";
import { TransactionalFileSystem } from "./TransactionalFileSystem";

const isWindowsRootDirRegex = /^[a-z]+:[\\\/]$/i;
const path = runtime.path;

/** Utilities for working with files. */
export class FileUtils {
  /** @internal */
  private static standardizeSlashesRegex = /\\/g;
  /** @internal */
  private static trimSlashStartRegex = /^\//;
  /** @internal */
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
  static pathJoin<T extends string>(basePath: T, ...paths: string[]): T {
    if (FileUtils.pathIsAbsolute(basePath)) {
      // ensure nothing like /path/../otherPath happens by doing a path.normalize here
      return FileUtils.standardizeSlashes(path.normalize(path.join(basePath, ...paths))) as T;
    }
    return FileUtils.standardizeSlashes(path.join(basePath, ...paths)) as T;
  }

  /**
   * Gets if the path is absolute.
   * @param fileOrDirPath - File or directory path.
   */
  static pathIsAbsolute(fileOrDirPath: string) {
    return isAbsolutePath(fileOrDirPath);
  }

  /**
   * Gets the standardized absolute path.
   * @param fileSystem - File system.
   * @param fileOrDirPath - Path to standardize.
   * @param relativeBase - Base path to be relative from.
   */
  static getStandardizedAbsolutePath(fileSystem: FileSystemHost, fileOrDirPath: string, relativeBase?: string): StandardizedFilePath {
    return FileUtils.standardizeSlashes(path.normalize(getAbsolutePath())) as StandardizedFilePath;

    function getAbsolutePath() {
      if (isAbsolutePath(fileOrDirPath))
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
  static getDirPath<T extends string>(fileOrDirPath: T): T {
    fileOrDirPath = FileUtils.standardizeSlashes(fileOrDirPath);

    const lastIndexOfSlash = fileOrDirPath.lastIndexOf("/");
    if (lastIndexOfSlash === -1)
      return "." as T;

    return FileUtils.standardizeSlashes(fileOrDirPath.substring(0, lastIndexOfSlash + 1) as T);
  }

  /**
   * Gets the last portion of the path.
   * @param fileOrDirPath - Path to get the base name from.
   */
  static getBaseName(fileOrDirPath: StandardizedFilePath) {
    const lastIndexOfSlash = fileOrDirPath.lastIndexOf("/");
    // when -1 this will be 0
    return fileOrDirPath.substring(lastIndexOfSlash + 1);
  }

  /**
   * Gets the extension of the file name.
   * @param fileOrDirPath - Path to get the extension from.
   */
  static getExtension(fileOrDirPath: StandardizedFilePath) {
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
  static standardizeSlashes<T extends string>(fileOrDirPath: T): T {
    let result = fileOrDirPath.replace(this.standardizeSlashesRegex, "/");
    // remove the last slash
    if (!FileUtils.isRootDirPath(result) && result.endsWith("/"))
      result = result.substring(0, result.length - 1);
    return result as T;
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
  static getParentMostPaths(paths: StandardizedFilePath[]) {
    const finalPaths: StandardizedFilePath[] = [];

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
  static async readFileOrNotExists(fileSystem: FileSystemHost, filePath: StandardizedFilePath, encoding: string) {
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
  static readFileOrNotExistsSync(fileSystem: FileSystemHost, filePath: StandardizedFilePath, encoding: string) {
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
  static getRelativePathTo(absoluteDirPathFrom: StandardizedFilePath, absolutePathTo: StandardizedFilePath) {
    const relativePath = path.relative(absoluteDirPathFrom, FileUtils.getDirPath(absolutePathTo));
    return FileUtils.standardizeSlashes(path.join(relativePath, FileUtils.getBaseName(absolutePathTo))) as StandardizedFilePath;
  }

  /**
   * Gets if the path is for the root directory.
   * @param path - Path.
   */
  static isRootDirPath(dirOrFilePath: string) {
    return dirOrFilePath === "/" || isWindowsRootDirRegex.test(dirOrFilePath);
  }

  /**
   * Gets the descendant directories of the specified directory.
   * @param dirPath - Directory path.
   */
  static *getDescendantDirectories(fileSystemWrapper: TransactionalFileSystem, dirPath: StandardizedFilePath): IterableIterator<StandardizedFilePath> {
    for (const entry of fileSystemWrapper.readDirSync(dirPath)) {
      if (!entry.isDirectory)
        continue;

      yield entry.path;
      yield* FileUtils.getDescendantDirectories(fileSystemWrapper, entry.path);
    }
  }

  /**
   * Gets the glob as absolute.
   * @param glob - Glob.
   * @param cwd - Current working directory.
   */
  static toAbsoluteGlob(glob: string, cwd: string) {
    // adapted from https://github.com/micromatch/to-absolute-glob
    // trim starting ./ from glob patterns
    if (glob.slice(0, 2) === "./")
      glob = glob.slice(2);

    // when the glob pattern is only a . use an empty string
    if (glob.length === 1 && glob === ".")
      glob = "";

    // store last character before glob is modified
    const suffix = glob.slice(-1);

    // check to see if glob is negated (and not a leading negated-extglob)
    const isNegated = FileUtils.isNegatedGlob(glob);
    if (isNegated)
      glob = glob.slice(1); // remove the leading "!"

    // make glob absolute
    if (!isAbsolutePath(glob) || glob.slice(0, 1) === "\\")
      glob = globJoin(cwd, glob);

    // if glob had a trailing `/`, re-add it now in case it was removed
    if (suffix === "/" && glob.slice(-1) !== "/")
      glob += "/";

    // re-add leading `!` if it was removed
    return isNegated ? "!" + glob : glob;
  }

  /**
   * Gets if the glob is a negated glob.
   * @param glob - Glob.
   */
  static isNegatedGlob(glob: string) {
    // https://github.com/micromatch/is-negated-glob/blob/master/index.js
    return glob[0] === "!" && glob[1] !== "(";
  }
}

function globJoin(dir: string, glob: string) {
  // from https://github.com/micromatch/to-absolute-glob
  if (dir.charAt(dir.length - 1) === "/")
    dir = dir.slice(0, -1);
  if (glob.charAt(0) === "/")
    glob = glob.slice(1);
  if (!glob)
    return dir;
  return dir + "/" + glob;
}

// Code adapted from https://github.com/jonschlinkert/is-absolute/blob/master/index.js
function isAbsolutePath(filePath: string) {
  return filePath.startsWith("/") || isWindowsAbsolutePath(filePath);
}

const isWindowsAbsolutePathRegex = /^[a-z]+:[\\\/]/i;
function isWindowsAbsolutePath(filePath: string) {
  return isWindowsAbsolutePathRegex.test(filePath) || isAzureAbsolutePath(filePath) || isUncPath(filePath);
}

function isAzureAbsolutePath(filePath: string) {
  // Microsoft Azure absolute filepath apparently
  return filePath.startsWith("\\\\");
}

// https://github.com/regexhq/unc-path-regex/blob/master/index.js
const uncPathRegex = /^[\\\/]{2,}[^\\\/]+[\\\/]+[^\\\/]+/;
function isUncPath(filePath: string) {
  return uncPathRegex.test(filePath);
}
