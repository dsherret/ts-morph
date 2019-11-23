import { ts } from "../typescript";
import { TransactionalFileSystem } from "../fileSystem";
import { readDirectory } from "./readDirectory";

export interface GetTsParseConfigHostOptions {
    encoding: string;
}

export interface TsParseConfigHostResult extends ts.ParseConfigHost {
    getDirectories(): string[];
    clearDirectories(): void;
}

export function getTsParseConfigHost(fileSystemWrapper: TransactionalFileSystem, options: GetTsParseConfigHostOptions) {
    const directories: string[] = [];
    const useCaseSensitiveFileNames = false; // shouldn't this be true? (it was false like this in the compiler)
    const host: TsParseConfigHostResult = {
        useCaseSensitiveFileNames,
        readDirectory: (rootDir, extensions, excludes, includes, depth) => {
            const result = readDirectory(fileSystemWrapper, useCaseSensitiveFileNames, rootDir, extensions, excludes, includes, depth);
            directories.push(...result.directories);
            return result.files;
        },
        fileExists: path => fileSystemWrapper.fileExistsSync(fileSystemWrapper.getStandardizedAbsolutePath(path)),
        readFile: path => fileSystemWrapper.readFileSync(fileSystemWrapper.getStandardizedAbsolutePath(path), options.encoding),
        getDirectories: () => [...directories],
        clearDirectories: () => directories.length = 0
    };
    return host;
}
