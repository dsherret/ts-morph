import fastGlob from "fast-glob";
import * as fs from "fs";
import * as minimatch from "minimatch";
import * as mkdirp from "mkdirp";
import * as os from "os";
import * as path from "path";
import { Runtime, RuntimeFileInfo, RuntimeFileSystem, RuntimePath } from "./Runtime";

export class NodeRuntime implements Runtime {
  fs = new NodeRuntimeFileSystem();
  path = new NodeRuntimePath();

  getEnvVar(name: string) {
    return process?.env[name];
  }

  getEndOfLine() {
    return os.EOL;
  }

  getPathMatchesPattern(path: string, pattern: string) {
    return minimatch.minimatch(path, pattern);
  }
}

class NodeRuntimePath implements RuntimePath {
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

class NodeRuntimeFileSystem implements RuntimeFileSystem {
  delete(path: string) {
    return new Promise<void>((resolve, reject) => {
      fs.rm(path, { recursive: true }, err => {
        if (err)
          reject(err);
        else
          resolve();
      });
    });
  }

  deleteSync(path: string) {
    fs.rmSync(path, { recursive: true });
  }

  readDirSync(dirPath: string) {
    const entries = fs.readdirSync(dirPath, {
      withFileTypes: true,
    });
    return entries.map(e => ({
      name: e.name,
      isFile: e.isFile(),
      isDirectory: e.isDirectory(),
      isSymlink: e.isSymbolicLink(),
    }));
  }

  readFile(filePath: string, encoding = "utf-8") {
    return new Promise<string>((resolve, reject) => {
      // what's up with these types?
      fs.readFile(filePath, encoding as any, (err, data) => {
        if (err)
          reject(err);
        else
          resolve(data as any as string);
      });
    });
  }

  readFileSync(filePath: string, encoding = "utf-8") {
    return fs.readFileSync(filePath, encoding as "utf-8"); // todo: fix this...
  }

  async writeFile(filePath: string, fileText: string) {
    await new Promise<void>((resolve, reject) => {
      fs.writeFile(filePath, fileText, err => {
        if (err)
          reject(err);
        else
          resolve();
      });
    });
  }

  writeFileSync(filePath: string, fileText: string) {
    fs.writeFileSync(filePath, fileText);
  }

  async mkdir(dirPath: string) {
    await mkdirp.mkdirp(dirPath);
  }

  mkdirSync(dirPath: string) {
    mkdirp.sync(dirPath);
  }

  move(srcPath: string, destPath: string) {
    return new Promise<void>((resolve, reject) => {
      fs.rename(srcPath, destPath, err => {
        if (err)
          reject(err);
        else
          resolve();
      });
    });
  }

  moveSync(srcPath: string, destPath: string) {
    fs.renameSync(srcPath, destPath);
  }

  copy(srcPath: string, destPath: string) {
    return new Promise<void>((resolve, reject) => {
      // this overwrites by default
      fs.copyFile(srcPath, destPath, err => {
        if (err)
          reject(err);
        else
          resolve();
      });
    });
  }

  copySync(srcPath: string, destPath: string) {
    fs.copyFileSync(srcPath, destPath);
  }

  stat(path: string) {
    return new Promise<RuntimeFileInfo | undefined>((resolve, reject) => {
      fs.stat(path, (err, stat) => {
        if (err) {
          if (err.code === "ENOENT" || err.code === "ENOTDIR")
            resolve(undefined);
          else
            reject(err);
        } else {
          resolve(stat);
        }
      });
    });
  }

  statSync(path: string) {
    return fs.statSync(path, { throwIfNoEntry: false });
  }

  realpathSync(path: string) {
    return fs.realpathSync(path);
  }

  getCurrentDirectory(): string {
    return path.resolve();
  }

  glob(patterns: ReadonlyArray<string>) {
    return fastGlob(patterns as string[], {
      cwd: this.getCurrentDirectory(),
      absolute: true,
    });
  }

  globSync(patterns: ReadonlyArray<string>) {
    return fastGlob.sync(patterns as string[], {
      cwd: this.getCurrentDirectory(),
      absolute: true,
    });
  }

  isCaseSensitive() {
    const platform = process?.platform;
    return platform !== "win32" && platform !== "darwin";
  }
}
