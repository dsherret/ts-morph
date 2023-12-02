export interface Runtime {
  fs: RuntimeFileSystem;
  path: RuntimePath;

  getEnvVar(name: string): string | undefined;
  getEndOfLine(): string;
  getPathMatchesPattern(path: string, pattern: string): boolean;
}

export interface RuntimeDirEntry {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
}

export interface RuntimeFileInfo {
  isFile(): boolean;
  isDirectory(): boolean;
}

export interface RuntimeFileSystem {
  /** Gets if this file system is case sensitive. */
  isCaseSensitive(): boolean;
  /** Asynchronously deletes the specified file or directory. */
  delete(path: string): Promise<void>;
  /** Synchronously deletes the specified file or directory */
  deleteSync(path: string): void;
  /** Reads all the child directories and files. */
  readDirSync(dirPath: string): RuntimeDirEntry[];
  /** Asynchronously reads a file at the specified path. */
  readFile(filePath: string, encoding?: string): Promise<string>;
  /** Synchronously reads a file at the specified path. */
  readFileSync(filePath: string, encoding?: string): string;
  /** Asynchronously writes a file to the file system. */
  writeFile(filePath: string, fileText: string): Promise<void>;
  /** Synchronously writes a file to the file system. */
  writeFileSync(filePath: string, fileText: string): void;
  /** Asynchronously creates a directory at the specified path. */
  mkdir(dirPath: string): Promise<void>;
  /** Synchronously creates a directory at the specified path. */
  mkdirSync(dirPath: string): void;
  /** Asynchronously moves a file or directory. */
  move(srcPath: string, destPath: string): Promise<void>;
  /** Synchronously moves a file or directory. */
  moveSync(srcPath: string, destPath: string): void;
  /** Asynchronously copies a file or directory. */
  copy(srcPath: string, destPath: string): Promise<void>;
  /** Synchronously copies a file or directory. */
  copySync(srcPath: string, destPath: string): void;
  /** Asynchronously gets the path's stat information. */
  stat(path: string): Promise<RuntimeFileInfo | undefined>;
  /** Synchronously gets the path's stat information. */
  statSync(path: string): RuntimeFileInfo | undefined;
  /** See https://nodejs.org/api/fs.html#fs_fs_realpathsync_path_options */
  realpathSync(path: string): string;
  /** Gets the current directory of the environment. */
  getCurrentDirectory(): string;
  /** Uses pattern matching to find files or directories. */
  glob(patterns: ReadonlyArray<string>): Promise<string[]>;
  /** Synchronously uses pattern matching to find files or directories. */
  globSync(patterns: ReadonlyArray<string>): string[];
}

export interface RuntimePath {
  /** Joins the paths. */
  join(...paths: string[]): string;
  /** Normalizes the provided path. */
  normalize(path: string): string;
  /** Returns the relative path from `from` to `to`. */
  relative(from: string, to: string): string;
}
