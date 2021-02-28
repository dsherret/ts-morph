import { Runtime, RuntimeFileSystem, RuntimePath } from "./Runtime";

export class NodeRuntime implements Runtime {
    fs = new NodeRuntimeFileSystem();
    path = new NodeRuntimePath();

    getEnvVar(name: string) {
        return process.env[name];
    }
}

class NodeRuntimePath implements RuntimePath {
    private path: typeof import("path") = require("path");

    join(...paths: string[]) {
        return this.path.join(...paths);
    }

    normalize(path: string) {
        return this.path.normalize(path);
    }

    dirname(path: string) {
        return this.path.dirname(path);
    }

    basename(path: string) {
        return this.path.basename(path);
    }

    relative(from: string, to: string) {
        return this.path.relative(from, to);
    }
}

class NodeRuntimeFileSystem implements RuntimeFileSystem {
    // Prevent these from being loaded in environments that don't support it (ex. browsers or Deno).
    // This means if someone specifies to use an in-memory file system then it won't load this.
    private fs: typeof import("fs") = require("fs");
    private fastGlob: typeof import("fast-glob") = require("fast-glob");
    private mkdirp: typeof import("mkdirp") = require("mkdirp");
    private path: typeof import("path") = require("path");

    delete(path: string) {
        return new Promise<void>((resolve, reject) => {
            this.fs.unlink(path, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    deleteSync(path: string) {
        this.fs.unlinkSync(path);
    }

    readDirSync(dirPath: string) {
        return this.fs.readdirSync(dirPath);
    }

    readFile(filePath: string, encoding = "utf-8") {
        return new Promise<string>((resolve, reject) => {
            this.fs.readFile(filePath, encoding, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }

    readFileSync(filePath: string, encoding = "utf-8") {
        return this.fs.readFileSync(filePath, encoding as "utf-8"); // todo: fix this...
    }

    async writeFile(filePath: string, fileText: string) {
        await new Promise<void>((resolve, reject) => {
            this.fs.writeFile(filePath, fileText, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    writeFileSync(filePath: string, fileText: string) {
        this.fs.writeFileSync(filePath, fileText);
    }

    async mkdir(dirPath: string) {
        await this.mkdirp(dirPath);
    }

    mkdirSync(dirPath: string) {
        this.mkdirp.sync(dirPath);
    }

    move(srcPath: string, destPath: string) {
        return new Promise<void>((resolve, reject) => {
            this.fs.rename(srcPath, destPath, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    moveSync(srcPath: string, destPath: string) {
        this.fs.renameSync(srcPath, destPath);
    }

    copy(srcPath: string, destPath: string) {
        return new Promise<void>((resolve, reject) => {
            // this overwrites by default
            this.fs.copyFile(srcPath, destPath, err => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }

    copySync(srcPath: string, destPath: string) {
        this.fs.copyFileSync(srcPath, destPath);
    }

    fileExists(filePath: string) {
        return new Promise<boolean>(resolve => {
            this.fs.stat(filePath, (err, stat) => {
                if (err)
                    resolve(false);
                else
                    resolve(stat.isFile());
            });
        });
    }

    fileExistsSync(filePath: string) {
        try {
            return this.fs.statSync(filePath).isFile();
        } catch (err) {
            return false;
        }
    }

    directoryExists(dirPath: string) {
        return new Promise<boolean>(resolve => {
            this.fs.stat(dirPath, (err, stat) => {
                if (err)
                    resolve(false);
                else
                    resolve(stat.isDirectory());
            });
        });
    }

    directoryExistsSync(dirPath: string) {
        try {
            return this.fs.statSync(dirPath).isDirectory();
        } catch (err) {
            return false;
        }
    }

    realpathSync(path: string) {
        return this.fs.realpathSync(path);
    }

    getCurrentDirectory(): string {
        return this.path.resolve();
    }

    glob(patterns: ReadonlyArray<string>) {
        return this.fastGlob(patterns as string[], {
            cwd: this.getCurrentDirectory(),
            absolute: true,
        });
    }

    globSync(patterns: ReadonlyArray<string>) {
        return this.fastGlob.sync(patterns as string[], {
            cwd: this.getCurrentDirectory(),
            absolute: true,
        });
    }

    isCaseSensitive() {
        const platform = process.platform;
        return platform !== "win32" && platform !== "darwin";
    }
}
