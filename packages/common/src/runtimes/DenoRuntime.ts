// @ts-ignore
import * as stdFs from "https://deno.land/std@0.89.0/fs/mod.ts";
// @ts-ignore
import * as stdPath from "https://deno.land/std@0.89.0/path/mod.ts";

declare var Deno: any;

export class DenoRuntime {
    fs = new DenoRuntimeFileSystem();
    path = new DenoRuntimePath();

    getEnvVar(name: string) {
        return Deno.env.get(name);
    }

    getEndOfLine() {
        return Deno.build.os === "windows" ? "\r\n" : "\n";
    }

    getPathMatchesPattern(path: string, pattern: string) {
        return stdPath.globToRegExp(pattern, {
            extended: true,
            globstar: true,
            os: "linux", // use the same behaviour across all operating systems
        }).test(path);
    }
}

class DenoRuntimePath {
    join(...paths: string[]) {
        return stdPath.join(...paths);
    }

    normalize(path: string) {
        return stdPath.normalize(path);
    }

    relative(from: string, to: string) {
        return stdPath.relative(from, to);
    }
}

class DenoRuntimeFileSystem {
    delete(path: string) {
        return Deno.remove(path);
    }

    deleteSync(path: string) {
        Deno.removeSync(path);
    }

    readDirSync(dirPath: string) {
        // @ts-ignore
        return Array.from(Deno.readDirSync(dirPath)).map(entry => entry.name);
    }

    readFile(filePath: string, _encoding = "utf-8") {
        return Deno.readTextFile(filePath);
    }

    readFileSync(filePath: string, _encoding = "utf-8") {
        return Deno.readTextFileSync(filePath);
    }

    writeFile(filePath: string, fileText: string) {
        return Deno.writeTextFile(filePath, fileText);
    }

    writeFileSync(filePath: string, fileText: string) {
        return Deno.writeTextFileSync(filePath, fileText);
    }

    async mkdir(dirPath: string) {
        await stdFs.ensureDir(dirPath);
    }

    mkdirSync(dirPath: string) {
        stdFs.ensureDirSync(dirPath);
    }

    move(srcPath: string, destPath: string) {
        return Deno.rename(srcPath, destPath);
    }

    moveSync(srcPath: string, destPath: string) {
        Deno.renameSync(srcPath, destPath);
    }

    copy(srcPath: string, destPath: string) {
        return Deno.copyFile(srcPath, destPath);
    }

    copySync(srcPath: string, destPath: string) {
        return Deno.copyFileSync(srcPath, destPath);
    }

    async fileExists(filePath: string) {
        try {
            const stat = await Deno.stat(filePath);
            return stat.isFile;
        } catch {
            return false;
        }
    }

    fileExistsSync(filePath: string) {
        try {
            return Deno.statSync(filePath).isFile;
        } catch {
            return false;
        }
    }

    async directoryExists(dirPath: string) {
        try {
            const stat = await Deno.stat(dirPath);
            return stat.isDirectory;
        } catch {
            return false;
        }
    }

    directoryExistsSync(dirPath: string) {
        try {
            return Deno.statSync(dirPath).isDirectory;
        } catch (err) {
            return false;
        }
    }

    realpathSync(path: string) {
        return Deno.realPathSync(path);
    }

    getCurrentDirectory(): string {
        return Deno.cwd();
    }

    glob(patterns: ReadonlyArray<string>) {
        const { excludePatterns, pattern } = globPatternsToPattern(patterns);
        return stdFs.expandGlob(pattern, {
            root: this.getCurrentDirectory(),
            extended: true,
            globstar: true,
            exclude: excludePatterns,
        });
    }

    globSync(patterns: ReadonlyArray<string>) {
        const { excludePatterns, pattern } = globPatternsToPattern(patterns);
        return stdFs.expandGlobSync(pattern, {
            root: this.getCurrentDirectory(),
            extended: true,
            globstar: true,
            exclude: excludePatterns,
        });
    }

    isCaseSensitive() {
        const platform = Deno.build.os;
        return platform !== "windows" && platform !== "darwin";
    }
}

function globPatternsToPattern(patterns: ReadonlyArray<string>) {
    const excludePatterns = [];
    const includePatterns = [];

    for (const pattern of patterns) {
        if (isNegatedGlob(pattern))
            excludePatterns.push(pattern);
        else
            includePatterns.push(pattern);
    }

    return {
        excludePatterns,
        pattern: includePatterns.length === 0 ? "." : includePatterns.length === 1 ? includePatterns[0] : `{${includePatterns.join(",")}}`,
    };

    function isNegatedGlob(glob: string) {
        // https://github.com/micromatch/is-negated-glob/blob/master/index.js
        return glob[0] === "!" && glob[1] !== "(";
    }
}
