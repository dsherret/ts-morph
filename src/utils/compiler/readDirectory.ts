import * as tsInternal from "../../typescript/tsInternal";
import { FileSystemWrapper } from "../../fileSystem";
import { FileUtils } from "../../utils";

export function readDirectory(
    fileSystemWrapper: FileSystemWrapper,
    useCaseSensitiveFileNames: boolean,
    rootDir: string,
    extensions: ReadonlyArray<string>,
    excludes: ReadonlyArray<string> | undefined,
    includes: ReadonlyArray<string>,
    depth?: number
) {
    const currentDir = fileSystemWrapper.getCurrentDirectory();
    const directories: string[] = [];

    // start: code from compiler api
    const regexFlag = useCaseSensitiveFileNames ? "" : "i";
    const patterns = tsInternal.getFileMatcherPatterns(rootDir, excludes || [], includes, useCaseSensitiveFileNames, currentDir);
    const includeDirectoryRegex = patterns.includeDirectoryPattern && new RegExp(patterns.includeDirectoryPattern, regexFlag);
    const excludeRegex = patterns.excludePattern && new RegExp(patterns.excludePattern, regexFlag);
    // end

    return {
        files: tsInternal.matchFiles(
            rootDir,
            extensions,
            excludes || [],
            includes,
            useCaseSensitiveFileNames,
            currentDir,
            undefined,
            path => {
                const includeDir = dirPathMatches(path);
                path = fileSystemWrapper.getStandardizedAbsolutePath(path);
                if (includeDir)
                    directories.push(path);
                return getFileSystemEntries(path, fileSystemWrapper);
            },
            path => fileSystemWrapper.realpathSync(path)
        ),
        directories
    };

    function dirPathMatches(absoluteName: string) {
        // needed for the regex to match
        if (absoluteName[absoluteName.length - 1] !== "/")
            absoluteName += "/";

        // condition is from compiler api
        return (!includeDirectoryRegex || includeDirectoryRegex.test(absoluteName))
            && (!excludeRegex || !excludeRegex.test(absoluteName));
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
