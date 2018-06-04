/* barrel:ignore */
import { FileSystemWrapper } from "../../fileSystem";
import { ts } from "../../typescript";
import * as tsInternal from "../../typescript/tsInternal";
import { FileUtils } from "../../utils";

export interface GetTsParseConfigHostOptions {
    encoding: string;
}

export interface TsParseConfigHostResult extends ts.ParseConfigHost {
    getDirectories(): string[];
    clearDirectories(): void;
}

export function getTsParseConfigHost(fileSystemWrapper: FileSystemWrapper, options: GetTsParseConfigHostOptions) {
    const directories: string[] = [];
    const currentDir = fileSystemWrapper.getCurrentDirectory();
    const useCaseSensitiveFileNames = false; // shouldn't this be true? (it was false like this in the compiler)
    const host: TsParseConfigHostResult = {
        useCaseSensitiveFileNames,
        readDirectory: (rootDir, extensions, excludes, includes) => {
            // start: code from compiler api
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
                        directories.push(path);
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
        readFile: path => fileSystemWrapper.readFileSync(path, options.encoding),
        getDirectories: () => [...directories],
        clearDirectories: () => directories.length = 0
    };
    return host;
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
