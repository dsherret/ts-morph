import * as errors from "./../../errors";
import {ts, CompilerOptions} from "./../../typescript";
import {Diagnostic} from "./../../compiler";
import {FileSystemWrapper} from "./../../fileSystem";
import {ArrayUtils, FileUtils, createHashSet} from "./../../utils";

export interface TsConfigParseResult {
    config?: any;
    error?: ts.Diagnostic;
}

export interface TsConfigParseOptions {
    tsConfigFilePath: string;
    encoding: string;
    fileSystemWrapper: FileSystemWrapper;
}

export function getTsConfigParseResult(opts: TsConfigParseOptions) {
    const {encoding, fileSystemWrapper} = opts;
    const tsConfigFilePath = fileSystemWrapper.getStandardizedAbsolutePath(opts.tsConfigFilePath);
    errors.throwIfFileNotExists(fileSystemWrapper, tsConfigFilePath);

    const parseResult: TsConfigParseResult = ts.parseConfigFileTextToJson(tsConfigFilePath, fileSystemWrapper.readFileSync(tsConfigFilePath, encoding));
    if (parseResult.error != null)
        throw new Error(parseResult.error.messageText.toString());
    return parseResult;
}

export interface CompilerOptionsFromTsConfigParseResultOptions {
    tsConfigFilePath: string;
    fileSystemWrapper: FileSystemWrapper;
    tsConfigParseResult: TsConfigParseResult;
}

export function getCompilerOptionsFromTsConfigParseResult(opts: CompilerOptionsFromTsConfigParseResultOptions) {
    const {fileSystemWrapper, tsConfigParseResult: parseResult} = opts;
    const tsConfigFilePath = fileSystemWrapper.getStandardizedAbsolutePath(opts.tsConfigFilePath);
    const settings = ts.convertCompilerOptionsFromJson(parseResult.config.compilerOptions, FileUtils.getDirPath(tsConfigFilePath), tsConfigFilePath);
    return {
        options: settings.options,
        errors: (settings.errors || []).map(e => new Diagnostic(undefined, e))
    };
}

export interface FilePathsFromTsConfigParseResultOptions {
    tsConfigFilePath: string;
    encoding: string;
    fileSystemWrapper: FileSystemWrapper;
    tsConfigParseResult: TsConfigParseResult;
    compilerOptions: CompilerOptions;
}

export function getFilePathsFromTsConfigParseResult(opts: FilePathsFromTsConfigParseResultOptions) {
    const {encoding, fileSystemWrapper, tsConfigParseResult: parseResult, compilerOptions} = opts;
    const tsConfigFilePath = fileSystemWrapper.getStandardizedAbsolutePath(opts.tsConfigFilePath);
    const currentDir = fileSystemWrapper.getCurrentDirectory();
    const host: ts.ParseConfigHost = {
        useCaseSensitiveFileNames: true,
        readDirectory: (rootDir, extensions, excludes, includes) => tsMatchFiles(rootDir, extensions, excludes || [], includes, false, currentDir, undefined,
            path => getFileSystemEntries(path, fileSystemWrapper)),
        fileExists: path => fileSystemWrapper.fileExistsSync(path),
        readFile: path => fileSystemWrapper.readFileSync(path, encoding)
    };

    const files = createHashSet<string>();
    const tsConfigDir = FileUtils.getDirPath(tsConfigFilePath);

    for (const rootDir of getRootDirs()) {
        for (const filePath of getFilesFromDir(fileSystemWrapper.getStandardizedAbsolutePath(rootDir, tsConfigDir)))
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
            yield fileSystemWrapper.getStandardizedAbsolutePath(filePath);
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
    return (ts as any).matchFiles.apply(this, arguments);
}
/* tslint:enable:align */

interface FileSystemEntries {
    readonly files: ReadonlyArray<string>;
    readonly directories: ReadonlyArray<string>;
}

function getFileSystemEntries(path: string, fileSystemWrapper: FileSystemWrapper): FileSystemEntries {
    const files: string[] = [];
    const directories: string[] = [];
    try {
        const entries = fileSystemWrapper.readDirSync(path);

        for (const entry of entries) {
            if (fileSystemWrapper.fileExistsSync(entry))
                files.push(entry);
            else
                directories.push(entry);
        }
    } catch (err) {
        if (!FileUtils.isNotExistsError(err))
            throw err;
    }

    return { files, directories };
}
