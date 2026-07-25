import { Memoize } from "../decorators";
import { FileUtils, StandardizedFilePath, TransactionalFileSystem } from "../fileSystem";
import { createFileSystemAdapter } from "../tsgo/fileSystemAdapter";
import { createInProcessApi } from "../tsgo/inProcessApi";
import { ts } from "../typescript";

export class TsConfigResolver {
  readonly #encoding: string;
  readonly #fileSystem: TransactionalFileSystem;
  readonly #tsConfigFilePath: StandardizedFilePath;
  readonly #tsConfigDirPath: StandardizedFilePath;

  constructor(fileSystem: TransactionalFileSystem, tsConfigFilePath: StandardizedFilePath, encoding: string) {
    this.#tsConfigFilePath = fileSystem.getStandardizedAbsolutePath(tsConfigFilePath);
    this.#tsConfigDirPath = FileUtils.getDirPath(this.#tsConfigFilePath);
    this.#fileSystem = fileSystem;
    this.#encoding = encoding;
  }

  getCompilerOptions() {
    return this._parseJsonConfigFileContent().options;
  }

  getErrors() {
    return this._parseJsonConfigFileContent().errors || [];
  }

  @Memoize
  getPaths(compilerOptions?: ts.CompilerOptions) {
    const files = new Set<StandardizedFilePath>();
    const fileSystem = this.#fileSystem;
    const directories = new Set<StandardizedFilePath>();

    compilerOptions = compilerOptions ?? this.getCompilerOptions();

    const configFileContent = this._parseJsonConfigFileContent();

    for (let dirName of configFileContent.directories) {
      const dirPath = fileSystem.getStandardizedAbsolutePath(dirName);
      if (fileSystem.directoryExistsSync(dirPath))
        directories.add(dirPath);
    }

    for (let fileName of configFileContent.fileNames) {
      const filePath = fileSystem.getStandardizedAbsolutePath(fileName);
      const parentDirPath = FileUtils.getDirPath(filePath);
      if (fileSystem.fileExistsSync(filePath)) {
        directories.add(parentDirPath);
        files.add(filePath);
      }
    }

    return {
      filePaths: Array.from(files.values()),
      directoryPaths: Array.from(directories.values()),
    };
  }

  /**
   * Parses the tsconfig through tsgo, which reads the project's files through
   * the adapted file system so it sees the same state ts-morph does.
   *
   * Unlike the previous implementation this reports no separate directory list:
   * tsgo returns the resolved file names, and the directories are derived from
   * them by {@link getPaths}. Directories matched by the config but containing
   * no files are therefore no longer reported.
   */
  @Memoize
  private _parseJsonConfigFileContent() {
    const api = createInProcessApi({
      fs: createFileSystemAdapter(this.#fileSystem, { encoding: this.#encoding }),
      cwd: this.#tsConfigDirPath,
    });
    try {
      const result = api.parseConfigFile(this.#tsConfigFilePath);
      return {
        options: result.options as ts.CompilerOptions,
        fileNames: result.fileNames,
        errors: [] as ts.Diagnostic[],
        directories: [] as string[],
      };
    } finally {
      api.close();
    }
  }
}
