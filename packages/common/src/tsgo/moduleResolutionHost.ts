import { FileUtils, StandardizedFilePath, TransactionalFileSystem } from "../fileSystem";
import type { ModuleResolutionHost } from "./ts";

/**
 * The subset of a source file cache a module resolution host consults.
 *
 * Declared structurally so that both ts-morph's `CompilerFactory` and
 * `@ts-morph/bootstrap`'s `SourceFileCache` satisfy it as they are.
 */
export interface ModuleResolutionSourceFileContainer {
  containsDirectoryAtPath(dirPath: StandardizedFilePath): boolean;
  containsSourceFileAtPath(filePath: StandardizedFilePath): boolean;
  getSourceFileFromCacheFromFilePath(filePath: StandardizedFilePath): { getFullText(): string } | undefined;
  getChildDirectoriesOfDirectory(dirPath: StandardizedFilePath): StandardizedFilePath[];
}

/** Options for creating a module resolution host. */
export interface CreateModuleResolutionHostOptions {
  /** The transactional file system to use. */
  transactionalFileSystem: TransactionalFileSystem;
  /** The source file container to use. */
  sourceFileContainer: ModuleResolutionSourceFileContainer;
  /** Gets the encoding to use. */
  getEncoding(): string;
}

/**
 * Creates a module resolution host based on the provided options.
 *
 * The host answers out of the project's in-memory state first and falls back to
 * the file system, so a file that only exists in the project is still found.
 * @param options - Options for creating the module resolution host.
 */
export function createModuleResolutionHost(options: CreateModuleResolutionHostOptions): ModuleResolutionHost {
  const { transactionalFileSystem, sourceFileContainer, getEncoding } = options;
  return {
    directoryExists: dirName => {
      const dirPath = transactionalFileSystem.getStandardizedAbsolutePath(dirName);
      if (sourceFileContainer.containsDirectoryAtPath(dirPath))
        return true;
      return transactionalFileSystem.directoryExistsSync(dirPath);
    },
    fileExists: fileName => {
      const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
      if (sourceFileContainer.containsSourceFileAtPath(filePath))
        return true;
      return transactionalFileSystem.fileExistsSync(filePath);
    },
    readFile: fileName => {
      const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
      const sourceFile = sourceFileContainer.getSourceFileFromCacheFromFilePath(filePath);
      if (sourceFile != null)
        return sourceFile.getFullText();

      try {
        return transactionalFileSystem.readFileSync(filePath, getEncoding());
      } catch (err) {
        // this is what the compiler api does
        if (FileUtils.isNotExistsError(err))
          return undefined;
        throw err;
      }
    },
    getCurrentDirectory: () => transactionalFileSystem.getCurrentDirectory(),
    getDirectories: dirName => {
      const dirPath = transactionalFileSystem.getStandardizedAbsolutePath(dirName);
      const dirs = new Set<StandardizedFilePath>(transactionalFileSystem.readDirSync(dirPath).map(e => e.path));
      for (const childDirPath of sourceFileContainer.getChildDirectoriesOfDirectory(dirPath))
        dirs.add(childDirPath);
      return Array.from(dirs);
    },
    realpath: path => transactionalFileSystem.realpathSync(transactionalFileSystem.getStandardizedAbsolutePath(path)),
  };
}
