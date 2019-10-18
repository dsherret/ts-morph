import { CompilerOptionsContainer } from "../options";
import { TransactionalFileSystem, RealFileSystemHost, FileUtils } from "../fileSystem";
import { ts, ScriptTarget, CompilerOptions } from "../typescript";
import { ResolutionHost } from "./ResolutionHost";
import { TsSourceFileContainer } from "./TsSourceFileContainer";

/**
 * Options for creating the hosts.
 */
export interface CreateHostsOptions {
    /** The transactional file system to use. */
    transactionalFileSystem: TransactionalFileSystem;
    /** Container of source files to use. */
    sourceFileContainer: TsSourceFileContainer;
    /** Compiler options container to use. */
    compilerOptions: CompilerOptionsContainer;
    /** Newline kind to use. */
    getNewLine: () => "\r\n" | "\n";
    /** The resolution host used for resolving modules and type reference directives. */
    resolutionHost: ResolutionHost;
}

/**
 * Creates a language service host and compiler host.
 * @param options - Options for creating the hosts.
 */
export function createHosts(options: CreateHostsOptions) {
    const { transactionalFileSystem, sourceFileContainer, compilerOptions, getNewLine, resolutionHost } = options;
    let version = 0;
    const fileExistsSync = (path: string) => sourceFileContainer.containsSourceFileAtPath(path)
        || transactionalFileSystem.fileExistsSync(path);
    const languageServiceHost: ts.LanguageServiceHost = {
        getCompilationSettings: () => compilerOptions.get(),
        getNewLine,
        getScriptFileNames: () => sourceFileContainer.getSourceFilePaths(),
        getScriptVersion: fileName => {
            const sourceFile = sourceFileContainer.getSourceFileFromCacheFromFilePath(fileName);
            if (sourceFile == null)
                return (version++).toString();
            return sourceFileContainer.getSourceFileVersion(sourceFile);
        },
        getScriptSnapshot: fileName => {
            if (!fileExistsSync(fileName))
                return undefined;
            return ts.ScriptSnapshot.fromString(sourceFileContainer.addOrGetSourceFileFromFilePath(fileName, {
                markInProject: false,
                scriptKind: undefined
            })!.getFullText());
        },
        getCurrentDirectory: () => transactionalFileSystem.getCurrentDirectory(),
        getDefaultLibFileName: options => {
            if (transactionalFileSystem.getFileSystem() instanceof RealFileSystemHost)
                return ts.getDefaultLibFilePath(options);
            else {
                return FileUtils.pathJoin(
                    transactionalFileSystem.getCurrentDirectory(),
                    "node_modules/typescript/lib/" + ts.getDefaultLibFileName(options)
                );
            }
        },
        useCaseSensitiveFileNames: () => true,
        readFile: (path, encoding) => {
            if (sourceFileContainer.containsSourceFileAtPath(path))
                return sourceFileContainer.getSourceFileFromCacheFromFilePath(path)!.getFullText();
            return transactionalFileSystem.readFileSync(path, encoding);
        },
        fileExists: fileExistsSync,
        directoryExists: dirName => sourceFileContainer.containsDirectoryAtPath(dirName)
            || transactionalFileSystem.directoryExistsSync(dirName),
        resolveModuleNames: resolutionHost.resolveModuleNames,
        resolveTypeReferenceDirectives: resolutionHost.resolveTypeReferenceDirectives,
        getResolvedModuleWithFailedLookupLocationsFromCache: resolutionHost.getResolvedModuleWithFailedLookupLocationsFromCache
    };

    const compilerHost: ts.CompilerHost = {
        getSourceFile: (fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void) => {
            // todo: use languageVersion here?
            return sourceFileContainer.addOrGetSourceFileFromFilePath(fileName, {
                markInProject: false,
                scriptKind: undefined
            });
        },
        // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
        // getDefaultLibLocation: (...) => {},
        getDefaultLibFileName: (options: CompilerOptions) => languageServiceHost.getDefaultLibFileName(options),
        writeFile: (filePath, data, writeByteOrderMark, onError, sourceFiles) => {
            transactionalFileSystem.writeFileSync(filePath, writeByteOrderMark ? "\uFEFF" + data : data);
        },
        getCurrentDirectory: () => languageServiceHost.getCurrentDirectory(),
        getDirectories: (path: string) => transactionalFileSystem.getDirectories(path),
        fileExists: (fileName: string) => languageServiceHost.fileExists!(fileName),
        readFile: (fileName: string) => languageServiceHost.readFile!(fileName),
        getCanonicalFileName: (fileName: string) => transactionalFileSystem.getStandardizedAbsolutePath(fileName),
        useCaseSensitiveFileNames: () => languageServiceHost.useCaseSensitiveFileNames!(),
        getNewLine: () => languageServiceHost.getNewLine!(),
        getEnvironmentVariable: (name: string) => process.env[name],
        directoryExists: dirName => languageServiceHost.directoryExists!(dirName),
        resolveModuleNames: resolutionHost.resolveModuleNames,
        resolveTypeReferenceDirectives: resolutionHost.resolveTypeReferenceDirectives
    };

    return { languageServiceHost, compilerHost };
}
