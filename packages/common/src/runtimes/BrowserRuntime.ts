import minimatch from "minimatch";
import { Runtime, RuntimeFileSystem, RuntimePath } from "./Runtime";

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
        return minimatch(path, pattern);
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
    private _errorMessage =
        "Access to the file system is not supported in the browser. Please use an in-memory file system (specify `useInMemoryFileSystem: true` when creating the project).";

    delete(_path: string) {
        return Promise.reject(new Error(this._errorMessage));
    }

    deleteSync(_path: string) {
        throw new Error(this._errorMessage);
    }

    readDirSync(_dirPath: string): string[] {
        throw new Error(this._errorMessage);
    }

    readFile(_filePath: string, _encoding?: string): Promise<string> {
        return Promise.reject(new Error(this._errorMessage));
    }

    readFileSync(_filePath: string, _encoding?: string): string {
        throw new Error(this._errorMessage);
    }

    writeFile(_filePath: string, _fileText: string) {
        return Promise.reject(new Error(this._errorMessage));
    }

    writeFileSync(_filePath: string, _fileText: string) {
        throw new Error(this._errorMessage);
    }

    mkdir(_dirPath: string) {
        return Promise.reject(new Error(this._errorMessage));
    }

    mkdirSync(_dirPath: string) {
        throw new Error(this._errorMessage);
    }

    move(_srcPath: string, _destPath: string) {
        return Promise.reject(new Error(this._errorMessage));
    }

    moveSync(_srcPath: string, _destPath: string) {
        throw new Error(this._errorMessage);
    }

    copy(_srcPath: string, _destPath: string) {
        return Promise.reject(new Error(this._errorMessage));
    }

    copySync(_srcPath: string, _destPath: string) {
        throw new Error(this._errorMessage);
    }

    fileExists(_filePath: string): Promise<boolean> {
        return Promise.reject(new Error(this._errorMessage));
    }

    fileExistsSync(_filePath: string): boolean {
        throw new Error(this._errorMessage);
    }

    directoryExists(_dirPath: string): Promise<boolean> {
        return Promise.reject(new Error(this._errorMessage));
    }

    directoryExistsSync(_dirPath: string): boolean {
        throw new Error(this._errorMessage);
    }

    realpathSync(_path: string): string {
        throw new Error(this._errorMessage);
    }

    getCurrentDirectory(): string {
        throw new Error(this._errorMessage);
    }

    glob(_patterns: ReadonlyArray<string>): Promise<string[]> {
        return Promise.reject(new Error(this._errorMessage));
    }

    globSync(_patterns: ReadonlyArray<string>): string[] {
        throw new Error(this._errorMessage);
    }

    isCaseSensitive() {
        return true;
    }
}
