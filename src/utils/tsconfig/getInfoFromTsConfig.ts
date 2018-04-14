import * as errors from "../../errors";
import { ts, CompilerOptions } from "../../typescript";
import * as tsInternal from "../../typescript/tsInternal";
import { Diagnostic } from "../../compiler";
import { FileSystemWrapper } from "../../fileSystem";
import { ArrayUtils, FileUtils, createHashSet } from "../../utils";

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

export interface PathsFromTsConfigParseResultOptions {
    tsConfigFilePath: string;
    encoding: string;
    fileSystemWrapper: FileSystemWrapper;
    tsConfigParseResult: TsConfigParseResult;
    compilerOptions: CompilerOptions;
}

export interface PathsFromTsConfigParseResultResult {
    filePaths: string[];
    directoryPaths: string[];
}

export function getPathsFromTsConfigParseResult(opts: PathsFromTsConfigParseResultOptions): PathsFromTsConfigParseResultResult {
    const {encoding, fileSystemWrapper, tsConfigParseResult: parseResult, compilerOptions} = opts;
    const tsConfigFilePath = fileSystemWrapper.getStandardizedAbsolutePath(opts.tsConfigFilePath);
    const currentDir = fileSystemWrapper.getCurrentDirectory();
    const directories = createHashSet<string>();
    const host: ts.ParseConfigHost = {
        useCaseSensitiveFileNames: true,
        readDirectory: (rootDir, extensions, excludes, includes) => {
            // start: code from compiler api
            const useCaseSensitiveFileNames = false; // shouldn't this be true?
            const regexFlag = useCaseSensitiveFileNames ? "" : "i";
            const patterns = tsInternal.getFileMatcherPatterns(rootDir, excludes || [], includes, useCaseSensitiveFileNames, currentDir);
            const includeDirectoryRegex = patterns.includeDirectoryPattern && new RegExp(patterns.includeDirectoryPattern, regexFlag);
            const excludeRegex = patterns.excludePattern && new RegExp(patterns.excludePattern, regexFlag);
            // end

            return tsInternal.matchFiles(rootDir, extensions, excludes || [], includes, useCaseSensitiveFileNames, currentDir, undefined,
                path => {
                    const includeDir = dirPathMatches(path);
                    path = fileSystemWrapper.getStandardizedAbsolutePath(path);
                    if (includeDir)
                        directories.add(path);
                    return getFileSystemEntries(path, fileSystemWrapper);
                });

            function dirPathMatches(absoluteName: string) {
                // needed for the regex to match
                if (absoluteName[absoluteName.length - 1] !== "/")
                    absoluteName += "/";

                // condition is from compiler api
                return (!includeDirectoryRegex || includeDirectoryRegex.test(absoluteName))
                    && (!excludeRegex || !excludeRegex.test(absoluteName));
            }
        },
        fileExists: path => fileSystemWrapper.fileExistsSync(path),
        readFile: path => fileSystemWrapper.readFileSync(path, encoding)
    };

    const files = createHashSet<string>();
    const tsConfigDir = FileUtils.getDirPath(tsConfigFilePath);

    for (const rootDir of getRootDirs()) {
        for (const filePath of getFilesFromDir(fileSystemWrapper.getStandardizedAbsolutePath(rootDir, tsConfigDir)))
            files.add(filePath);
    }

    return {
        filePaths: ArrayUtils.from(files.values()),
        directoryPaths: ArrayUtils.from(directories.values())
    };

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

function getFileSystemEntries(path: string, fileSystemWrapper: FileSystemWrapper): tsInternal.FileSystemEntries {
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
