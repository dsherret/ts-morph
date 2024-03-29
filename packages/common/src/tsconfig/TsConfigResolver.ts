import { Memoize } from "../decorators";
import { FileUtils, StandardizedFilePath, TransactionalFileSystem } from "../fileSystem";
import { ts } from "../typescript";
import { getTsParseConfigHost, TsParseConfigHostResult } from "./getTsParseConfigHost";

export class TsConfigResolver {
  readonly #encoding: string;
  readonly #fileSystem: TransactionalFileSystem;
  readonly #host: TsParseConfigHostResult;
  readonly #tsConfigFilePath: StandardizedFilePath;
  readonly #tsConfigDirPath: StandardizedFilePath;

  constructor(fileSystem: TransactionalFileSystem, tsConfigFilePath: StandardizedFilePath, encoding: string) {
    this.#host = getTsParseConfigHost(fileSystem, { encoding });
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

  @Memoize
  private _parseJsonConfigFileContent() {
    this.#host.clearDirectories();
    const result = ts.parseJsonConfigFileContent(this.#getTsConfigFileJson(), this.#host, this.#tsConfigDirPath, undefined, this.#tsConfigFilePath);
    return { ...result, directories: this.#host.getDirectories() };
  }

  #getTsConfigFileJson() {
    const text = this.#fileSystem.readFileSync(this.#tsConfigFilePath, this.#encoding);
    const parseResult = ts.parseConfigFileTextToJson(this.#tsConfigFilePath, text);
    if (parseResult.error != null)
      throw new Error(parseResult.error.messageText.toString());
    return parseResult.config;
  }
}
