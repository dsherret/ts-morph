import * as minimatch from "minimatch";
import { Runtime, RuntimeDirEntry, RuntimeFileInfo, RuntimeFileSystem, RuntimePath } from "./Runtime";

const path = require("path-browserify");

export class BrowserRuntime implements Runtime {
  fs = new BrowserRuntimeFileSystem();
  path = new BrowserRuntimePath();

  getEnvVar(_name: string) {
    return undefined;
  }

  getEndOfLine() {
    return "\n";
  }

  getPathMatchesPattern(path: string, pattern: string) {
    return minimatch.minimatch(path, pattern);
  }
}

class BrowserRuntimePath implements RuntimePath {
  join(...paths: string[]) {
    return path.join(...paths);
  }

  normalize(pathToNormalize: string) {
    return path.normalize(pathToNormalize);
  }

  relative(from: string, to: string) {
    return path.relative(from, to);
  }
}

class BrowserRuntimeFileSystem implements RuntimeFileSystem {
  #errorMessage =
    "Access to the file system is not supported in the browser. Please use an in-memory file system (specify `useInMemoryFileSystem: true` when creating the project).";

  delete(_path: string) {
    return Promise.reject(new Error(this.#errorMessage));
  }

  deleteSync(_path: string) {
    throw new Error(this.#errorMessage);
  }

  readDirSync(_dirPath: string): RuntimeDirEntry[] {
    throw new Error(this.#errorMessage);
  }

  readFile(_filePath: string, _encoding?: string): Promise<string> {
    return Promise.reject(new Error(this.#errorMessage));
  }

  readFileSync(_filePath: string, _encoding?: string): string {
    throw new Error(this.#errorMessage);
  }

  writeFile(_filePath: string, _fileText: string) {
    return Promise.reject(new Error(this.#errorMessage));
  }

  writeFileSync(_filePath: string, _fileText: string) {
    throw new Error(this.#errorMessage);
  }

  mkdir(_dirPath: string) {
    return Promise.reject(new Error(this.#errorMessage));
  }

  mkdirSync(_dirPath: string) {
    throw new Error(this.#errorMessage);
  }

  move(_srcPath: string, _destPath: string) {
    return Promise.reject(new Error(this.#errorMessage));
  }

  moveSync(_srcPath: string, _destPath: string) {
    throw new Error(this.#errorMessage);
  }

  copy(_srcPath: string, _destPath: string) {
    return Promise.reject(new Error(this.#errorMessage));
  }

  copySync(_srcPath: string, _destPath: string) {
    throw new Error(this.#errorMessage);
  }

  stat(_path: string): Promise<RuntimeFileInfo> {
    return Promise.reject(new Error(this.#errorMessage));
  }

  statSync(_path: string): RuntimeFileInfo {
    throw new Error(this.#errorMessage);
  }

  realpathSync(_path: string): string {
    throw new Error(this.#errorMessage);
  }

  getCurrentDirectory(): string {
    throw new Error(this.#errorMessage);
  }

  glob(_patterns: ReadonlyArray<string>): Promise<string[]> {
    return Promise.reject(new Error(this.#errorMessage));
  }

  globSync(_patterns: ReadonlyArray<string>): string[] {
    throw new Error(this.#errorMessage);
  }

  isCaseSensitive() {
    return true;
  }
}
