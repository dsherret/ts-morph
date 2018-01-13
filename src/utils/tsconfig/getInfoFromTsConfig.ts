import * as ts from "typescript";
import * as errors from "./../../errors";
import {Diagnostic} from "./../../compiler";
import {FileSystemHost} from "./../../fileSystem";
import {ArrayUtils, FileUtils, createHashSet} from "./../../utils";

export interface TsConfigParseResult {
    config?: any;
    error?: ts.Diagnostic;
}

export function getTsConfigParseResult(tsConfigFilePath: string, fileSystem: FileSystemHost) {
    tsConfigFilePath = FileUtils.getStandardizedAbsolutePath(fileSystem, tsConfigFilePath);
    errors.throwIfFileNotExists(fileSystem, tsConfigFilePath);

    const parseResult: TsConfigParseResult = ts.parseConfigFileTextToJson(tsConfigFilePath, fileSystem.readFileSync(tsConfigFilePath));
    if (parseResult.error != null)
        throw new Error(parseResult.error.messageText.toString());
    return parseResult;
}

export function getCompilerOptionsFromTsConfigParseResult(tsConfigFilePath: string, fileSystem: FileSystemHost, parseResult: TsConfigParseResult) {
    tsConfigFilePath = FileUtils.getStandardizedAbsolutePath(fileSystem, tsConfigFilePath);
    const settings = ts.convertCompilerOptionsFromJson(parseResult.config.compilerOptions, FileUtils.getDirPath(tsConfigFilePath), tsConfigFilePath);
    return {
        options: settings.options,
        errors: (settings.errors || []).map(e => new Diagnostic(undefined, e))
    };
}

export function getFilePathsFromTsConfigParseResult(tsConfigFilePath: string, fileSystem: FileSystemHost, parseResult: TsConfigParseResult, compilerOptions: ts.CompilerOptions) {
    tsConfigFilePath = FileUtils.getStandardizedAbsolutePath(fileSystem, tsConfigFilePath);
    const currentDir = fileSystem.getCurrentDirectory();
    const host: ts.ParseConfigHost = {
        useCaseSensitiveFileNames: true,
        readDirectory: (rootDir, extensions, excludes, includes) => tsMatchFiles(rootDir, extensions, excludes, includes, false, currentDir, undefined,
            path => getFileSystemEntries(path, fileSystem)),
        fileExists: path => fileSystem.fileExistsSync(path),
        readFile: path => fileSystem.readFileSync(path)
    };

    const files = createHashSet<string>();
    const tsConfigDir = FileUtils.getDirPath(tsConfigFilePath);

    for (const rootDir of getRootDirs()) {
        for (const filePath of getFilesFromDir(FileUtils.getStandardizedAbsolutePath(fileSystem, rootDir, tsConfigDir)))
            files.add(filePath);
    }

    return ArrayUtils.from(files.values());

    function getRootDirs() {
        const result: string[] = [];
        if (typeof compilerOptions.rootDir === "string")
            result.push(compilerOptions.rootDir);
        if (compilerOptions.rootDirs != null)
            result.push(...compilerOptions.rootDirs);
        // use the tsconfig directory if no rootDir or rootDirs is specified
        if (result.length === 0)
            result.push(tsConfigDir);
        return result;
    }

    function* getFilesFromDir(dirPath: string) {
        for (const filePath of ts.parseJsonConfigFileContent(parseResult.config, host, dirPath, compilerOptions, undefined).fileNames)
            yield FileUtils.getStandardizedAbsolutePath(fileSystem, filePath);
    }
}

// todo: move this somewhere common
/* tslint:disable:align */
function tsMatchFiles(this: any,
    path: string,
    extensions: ReadonlyArray<string>,
    excludes: ReadonlyArray<string>,
    includes: ReadonlyArray<string>,
    useCaseSensitiveFileNames: boolean,
    currentDirectory: string,
    depth: number | undefined,
    getEntries: (path: string) => FileSystemEntries
): string[] {
    const version = ts.version.split(".");
    if (version[0] === "2" && version[1] === "4")
        return (ts as any).matchFiles(path, extensions, excludes, includes, useCaseSensitiveFileNames, currentDirectory, getEntries);
    else
        return (ts as any).matchFiles.apply(this, arguments);
}
/* tslint:enable:align */

interface FileSystemEntries {
    readonly files: ReadonlyArray<string>;
    readonly directories: ReadonlyArray<string>;
}

function getFileSystemEntries(path: string, fileSystem: FileSystemHost): FileSystemEntries {
    const entries = fileSystem.readDirSync(path);
    const files: string[] = [];
    const directories: string[] = [];

    for (const entry of entries) {
        if (fileSystem.fileExistsSync(entry))
            files.push(entry);
        else
            directories.push(entry);
    }

    return {files, directories};
}
