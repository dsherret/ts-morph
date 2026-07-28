import { errors, FileUtils, StandardizedFilePath, TransactionalFileSystem } from "@ts-morph/common";
import { SourceFile } from "../compiler";
import { CompilerFactory } from "../factories";
import { DirectoryAddOptions } from "./Directory";

/**
 * Contains common methods between Project and Directory.
 *
 * I'll definitely need to refactor this in the future... just putting these methods in a common place for now.
 */
export class DirectoryCoordinator {
  readonly #fileSystemWrapper: TransactionalFileSystem;
  readonly #compilerFactory: CompilerFactory;

  constructor(compilerFactory: CompilerFactory, fileSystemWrapper: TransactionalFileSystem) {
    this.#compilerFactory = compilerFactory;
    this.#fileSystemWrapper = fileSystemWrapper;
  }

  addDirectoryAtPathIfExists(dirPath: StandardizedFilePath, options: DirectoryAddOptions & { markInProject: boolean }) {
    const directory = this.#compilerFactory.getDirectoryFromPath(dirPath, options);
    if (directory == null)
      return undefined;

    if (options.recursive) {
      for (const descendantDirPath of FileUtils.getDescendantDirectories(this.#fileSystemWrapper, dirPath))
        this.#compilerFactory.createDirectoryOrAddIfExists(descendantDirPath, options);
    }

    return directory;
  }

  addDirectoryAtPath(dirPath: StandardizedFilePath, options: DirectoryAddOptions & { markInProject: boolean }) {
    const directory = this.addDirectoryAtPathIfExists(dirPath, options);
    if (directory == null)
      throw new errors.DirectoryNotFoundError(dirPath);
    return directory;
  }

  createDirectoryOrAddIfExists(dirPath: StandardizedFilePath, options: { markInProject: boolean }) {
    return this.#compilerFactory.createDirectoryOrAddIfExists(dirPath, options);
  }

  addSourceFileAtPathIfExists(filePath: StandardizedFilePath, options: { markInProject: boolean }): SourceFile | undefined {
    return this.#compilerFactory.addOrGetSourceFileFromFilePath(filePath, {
      markInProject: options.markInProject,
      scriptKind: undefined,
    });
  }

  addSourceFileAtPath(filePath: StandardizedFilePath, options: { markInProject: boolean }): SourceFile {
    const sourceFile = this.addSourceFileAtPathIfExists(filePath, options);
    if (sourceFile == null)
      throw new errors.FileNotFoundError(this.#fileSystemWrapper.getStandardizedAbsolutePath(filePath));
    return sourceFile;
  }

  /**
   * Adds the files at the given paths, throwing when one of them is not there.
   *
   * The files are added in one batch, which the document registry is much faster
   * at than the same paths added one at a time — see
   * `CompilerFactory#addOrGetSourceFilesFromFilePaths`.
   */
  addSourceFilesAtFilePaths(filePaths: readonly StandardizedFilePath[], options: { markInProject: boolean }): SourceFile[] {
    const sourceFiles = this.#compilerFactory.addOrGetSourceFilesFromFilePaths(filePaths, {
      markInProject: options.markInProject,
      scriptKind: undefined,
    });
    return sourceFiles.map((sourceFile, i) => {
      if (sourceFile == null)
        throw new errors.FileNotFoundError(this.#fileSystemWrapper.getStandardizedAbsolutePath(filePaths[i]));
      return sourceFile;
    });
  }

  addSourceFilesAtPaths(fileGlobs: string | ReadonlyArray<string>, options: { markInProject: boolean }): SourceFile[] {
    if (typeof fileGlobs === "string")
      fileGlobs = [fileGlobs];

    const globbedFilePaths: StandardizedFilePath[] = [];
    const globbedDirectories = new Set<StandardizedFilePath>();

    for (const filePath of this.#fileSystemWrapper.globSync(fileGlobs)) {
      globbedFilePaths.push(filePath);
      globbedDirectories.add(FileUtils.getDirPath(filePath));
    }

    const sourceFiles = this.#compilerFactory
      .addOrGetSourceFilesFromFilePaths(globbedFilePaths, { markInProject: options.markInProject, scriptKind: undefined })
      .filter(sourceFile => sourceFile != null);

    for (const dirPath of FileUtils.getParentMostPaths(Array.from(globbedDirectories)))
      this.addDirectoryAtPathIfExists(dirPath, { recursive: true, markInProject: options.markInProject });

    return sourceFiles;
  }
}
