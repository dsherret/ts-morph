import { CompilerOptionsContainer } from "../options";
import { TransactionalFileSystem, RealFileSystemHost, FileUtils, StandardizedFilePath } from "../fileSystem";
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
    const fileExistsSync = (path: StandardizedFilePath) => sourceFileContainer.containsSourceFileAtPath(path)
        || transactionalFileSystem.fileExistsSync(path);
    const languageServiceHost: ts.LanguageServiceHost = {
        getCompilationSettings: () => compilerOptions.get(),
        getNewLine,
        getScriptFileNames: () => Array.from(sourceFileContainer.getSourceFilePaths()),
        getScriptVersion: fileName => {
            const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
            const sourceFile = sourceFileContainer.getSourceFileFromCacheFromFilePath(filePath);
            if (sourceFile == null)
                return (version++).toString();
            return sourceFileContainer.getSourceFileVersion(sourceFile);
        },
        getScriptSnapshot: fileName => {
            const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
            if (!fileExistsSync(filePath))
                return undefined;
            return ts.ScriptSnapshot.fromString(sourceFileContainer.addOrGetSourceFileFromFilePath(filePath, {
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
            const standardizedPath = transactionalFileSystem.getStandardizedAbsolutePath(path);
            if (sourceFileContainer.containsSourceFileAtPath(standardizedPath))
                return sourceFileContainer.getSourceFileFromCacheFromFilePath(standardizedPath)!.getFullText();
            return transactionalFileSystem.readFileSync(standardizedPath, encoding);
        },
        fileExists: fileExistsSync,
        directoryExists: dirName => {
            const dirPath = transactionalFileSystem.getStandardizedAbsolutePath(dirName);
            return sourceFileContainer.containsDirectoryAtPath(dirPath)
                || transactionalFileSystem.directoryExistsSync(dirPath);
        },
        resolveModuleNames: resolutionHost.resolveModuleNames,
        resolveTypeReferenceDirectives: resolutionHost.resolveTypeReferenceDirectives,
        getResolvedModuleWithFailedLookupLocationsFromCache: resolutionHost.getResolvedModuleWithFailedLookupLocationsFromCache
    };

    const compilerHost: ts.CompilerHost = {
        getSourceFile: (fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void) => {
            // todo: use languageVersion here?
            const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
            return sourceFileContainer.addOrGetSourceFileFromFilePath(filePath, {
                markInProject: false,
                scriptKind: undefined
            });
        },
        // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
        // getDefaultLibLocation: (...) => {},
        getDefaultLibFileName: (options: CompilerOptions) => languageServiceHost.getDefaultLibFileName(options),
        writeFile: (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
            const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
            transactionalFileSystem.writeFileSync(filePath, writeByteOrderMark ? "\uFEFF" + data : data);
        },
        getCurrentDirectory: () => languageServiceHost.getCurrentDirectory(),
        getDirectories: (path: string) => transactionalFileSystem.getDirectories(transactionalFileSystem.getStandardizedAbsolutePath(path)),
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
