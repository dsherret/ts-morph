import * as ts from "typescript";
import * as errors from "./../../errors";
import {Diagnostic} from "./../../compiler";
import {FileSystemHost} from "./../../fileSystem";
import {FileUtils} from "./../../utils";

export interface TsConfigInfo {
    compilerOptions: ts.CompilerOptions;
    errors: Diagnostic[];
    filePaths?: string[];
}

export function getInfoFromTsConfig(filePath: string, fileSystem: FileSystemHost, opts: { shouldGetFilePaths: boolean; }): TsConfigInfo {
    filePath = FileUtils.getStandardizedAbsolutePath(fileSystem, filePath);
    errors.throwIfFileNotExists(fileSystem, filePath);

    const parseResult: ParseResult = ts.parseConfigFileTextToJson(filePath, fileSystem.readFileSync(filePath));
    if (parseResult.error != null)
        throw new Error(parseResult.error.messageText.toString());

    if (opts.shouldGetFilePaths)
        return getFilesAndCompilerOptions(fileSystem, parseResult, filePath);
    else
        return getOnlyCompilerOptions(parseResult, filePath);
}

function getFilesAndCompilerOptions(fileSystem: FileSystemHost, parseResult: ParseResult, filePath: string) {
    const currentDir = fileSystem.getCurrentDirectory();
    const host: ts.ParseConfigHost = {
        useCaseSensitiveFileNames: true,
        readDirectory: (rootDir, extensions, excludes, includes) => tsMatchFiles(rootDir, extensions, excludes, includes, false, currentDir, undefined,
            path => getFileSystemEntries(path, fileSystem)),
        fileExists: path => fileSystem.fileExistsSync(path),
        readFile: path => fileSystem.readFileSync(path)
    };
    const result = ts.parseJsonConfigFileContent(parseResult, host, fileSystem.getCurrentDirectory(), undefined, filePath);
    const compilerOptionsResult = getOnlyCompilerOptions(parseResult, filePath); // doesn't seem like there's a way to get this from result
    return {
        filePaths: result.fileNames,
        compilerOptions: compilerOptionsResult.compilerOptions,
        errors: compilerOptionsResult.errors
    };
}

function getOnlyCompilerOptions(parseResult: ParseResult, filePath: string) {
    const settings = ts.convertCompilerOptionsFromJson(parseResult.config.compilerOptions, FileUtils.getDirPath(filePath), filePath);
    return { compilerOptions: settings.options, errors: (settings.errors || []).map(e => new Diagnostic(undefined, e)) };
}

// todo: remove in TS 2.7 (I have a pull request to expose this)
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
    return (ts as any).matchFiles.apply(this, arguments);
}
/* tslint:enable:align */

interface ParseResult {
    config?: any;
    error?: ts.Diagnostic;
}

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
