import { Memoize } from "../decorators";
import { errors } from "../errors";
import { FileUtils, StandardizedFilePath, TransactionalFileSystem } from "../fileSystem";
import { createFileSystemAdapter } from "../tsgo/fileSystemAdapter";
import { type API, createInProcessApi } from "../tsgo/inProcessApi";
import { ts } from "../typescript";

export class TsConfigResolver {
  readonly #encoding: string;
  readonly #fileSystem: TransactionalFileSystem;
  readonly #tsConfigFilePath: StandardizedFilePath;
  readonly #tsConfigDirPath: StandardizedFilePath;
  #includedDirectories: string[] | undefined;

  constructor(fileSystem: TransactionalFileSystem, tsConfigFilePath: StandardizedFilePath, encoding: string) {
    this.#tsConfigFilePath = fileSystem.getStandardizedAbsolutePath(tsConfigFilePath);
    this.#tsConfigDirPath = FileUtils.getDirPath(this.#tsConfigFilePath);
    this.#fileSystem = fileSystem;
    this.#encoding = encoding;
  }

  getCompilerOptions() {
    return this._parseJsonConfigFileContent().options;
  }

  /** Gets the diagnostics from parsing the tsconfig. */
  getErrors(): ts.Diagnostic[] {
    return this._parseJsonConfigFileContent().errors;
  }

  @Memoize
  getPaths(compilerOptions?: ts.CompilerOptions) {
    const files = new Set<StandardizedFilePath>();
    const fileSystem = this.#fileSystem;
    const directories = new Set<StandardizedFilePath>();

    compilerOptions = compilerOptions ?? this.getCompilerOptions();

    for (const dirName of this.#getIncludedDirectories()) {
      const dirPath = fileSystem.getStandardizedAbsolutePath(dirName);
      if (fileSystem.directoryExistsSync(dirPath))
        directories.add(dirPath);
    }

    for (const fileName of this._parseJsonConfigFileContent().fileNames) {
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
   * Parses the tsconfig through tsgo, which reads the project's files through the
   * adapted file system so it sees the same state ts-morph does.
   */
  @Memoize
  private _parseJsonConfigFileContent() {
    const walkedDirectories: string[] = [];
    const result = this.#withApi(api => api.parseConfigFile(this.#tsConfigFilePath), { walkedDirectories });
    // the config's own syntax used to be checked by a separate JSON parse that
    // threw; tsgo folds those errors in with the rest, so they are raised here
    const syntaxError = result.errors?.find(error => error.code >= 1000 && error.code < 2000);
    if (syntaxError != null)
      throw new Error(syntaxError.text);
    const errors = (result.errors ?? []) as ts.Diagnostic[];
    return {
      options: withRejectedValuesAsUndefined(result.options as ts.CompilerOptions, errors),
      fileNames: result.fileNames,
      errors,
      walkedDirectories,
    };
  }

  /**
   * Gets the directories the tsconfig matches, including the ones that hold no files.
   *
   * tsgo returns only the resolved file names, so a directory matched by the config
   * but containing no file has nothing to be derived from. They are recovered by
   * asking tsgo the question directly: expanding the include globs reports every
   * directory the walk reached, and a second parse with a synthetic TypeScript file
   * placed in each of them keeps the ones whose synthetic file the config picked up.
   * A directory belongs to the project exactly when a file written in it would.
   */
  #getIncludedDirectories(): string[] {
    if (this.#includedDirectories != null)
      return this.#includedDirectories;

    const walkedDirectories = this._parseJsonConfigFileContent().walkedDirectories;
    if (walkedDirectories.length === 0)
      return this.#includedDirectories = []; // no include globs were expanded, so there is nothing to recover

    const probeDirectories = new Set(walkedDirectories);
    const result = this.#withApi(api => api.parseConfigFile(this.#tsConfigFilePath), { probeDirectories });
    const included: string[] = [];
    for (const fileName of result.fileNames) {
      const path = fileName as StandardizedFilePath;
      if (FileUtils.getBaseName(path) === directoryProbeFileName)
        included.push(FileUtils.getDirPath(path));
    }
    return this.#includedDirectories = included;
  }

  #withApi<T>(action: (api: API) => T, hooks: { walkedDirectories?: string[]; probeDirectories?: Set<string> }): T {
    if (!this.#fileSystem.fileExistsSync(this.#tsConfigFilePath))
      throw new errors.FileNotFoundError(this.#tsConfigFilePath);

    const fs = createFileSystemAdapter(this.#fileSystem, { encoding: this.#encoding });
    const api = createInProcessApi({
      fs: {
        ...fs,
        getAccessibleEntries: dirPath => {
          const entries = fs.getAccessibleEntries!(dirPath);
          if (entries == null)
            return entries;
          hooks.walkedDirectories?.push(dirPath);
          if (hooks.probeDirectories?.has(dirPath))
            return { ...entries, files: [...entries.files, directoryProbeFileName] };
          return entries;
        },
      },
      cwd: this.#tsConfigDirPath,
    });
    try {
      return action(api);
    } finally {
      api.close();
    }
  }
}

/** Name of the file {@link TsConfigResolver} uses to ask whether a directory is in the project. */
const directoryProbeFileName = "__ts_morph_directory_probe__.ts";

/**
 * Compiler options whose value the config declared but tsgo could not use.
 *
 * tsgo omits such an option entirely, where ts-morph's contract is that the option
 * is present and `undefined` — a config that names an option has an opinion about
 * it, even when the value makes no sense.
 */
const rejectedValueMessages: ReadonlyArray<{ code: number; pattern: RegExp }> = [
  // Compiler option '{0}' requires a value of type {1}.
  { code: 5024, pattern: /^Compiler option '([^']+)'/ },
  // Argument for '{0}' option must be: {1}.
  { code: 6046, pattern: /^Argument for '--([^']+)'/ },
];

function withRejectedValuesAsUndefined(options: ts.CompilerOptions, errors: ReadonlyArray<ts.Diagnostic>): ts.CompilerOptions {
  const rejected: Record<string, undefined> = {};
  for (const error of errors) {
    const message = rejectedValueMessages.find(m => m.code === error.code);
    const name = message?.pattern.exec(error.text)?.[1];
    if (name != null && !(name in options))
      rejected[name] = undefined;
  }
  return { ...rejected, ...options };
}
