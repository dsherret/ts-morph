import { errors } from "../errors";
import { StandardizedFilePath, TransactionalFileSystem } from "../fileSystem";
import { getLibFiles, libFolderInMemoryPath } from "../getLibFiles";
import { CompilerOptionsContainer } from "../options";
import { runtime } from "../runtimes";
import { ScriptTarget, ts } from "../typescript";
import { nameof } from "../utils";
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
    /** Provides the current project version to be used to tell if source files have
     * changed. Provide this for a performance improvement. */
    getProjectVersion?: () => string;
    isKnownTypesPackageName?: ts.LanguageServiceHost["isKnownTypesPackageName"];
    /**
     * Set this to true to not load the typescript lib files.
     * @default false
     */
    skipLoadingLibFiles?: boolean;
    /**
     * Specify this to use a custom folder to load the lib files from.
     * @remarks skipLoadingLibFiles cannot be explicitly false if this is set.
     */
    libFolderPath?: string;
}

/**
 * Creates a language service host and compiler host.
 * @param options - Options for creating the hosts.
 */
export function createHosts(options: CreateHostsOptions) {
    const { transactionalFileSystem, sourceFileContainer, compilerOptions, getNewLine, resolutionHost, getProjectVersion, isKnownTypesPackageName } = options;
    let version = 0;
    const libFolderPath = transactionalFileSystem.getStandardizedAbsolutePath(getLibFolderPath());
    const libFileMap = getLibFileMap();

    const fileExistsSync = (path: StandardizedFilePath) =>
        sourceFileContainer.containsSourceFileAtPath(path)
        || transactionalFileSystem.fileExistsSync(path);
    const languageServiceHost: ts.LanguageServiceHost = {
        getCompilationSettings: () => compilerOptions.get(),
        getNewLine,
        getProjectVersion,
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
            if (!fileExistsSync(filePath)) {
                if (libFileMap != null) {
                    const libFileText = libFileMap.get(filePath);
                    if (libFileText != null)
                        return ts.ScriptSnapshot.fromString(libFileText);
                }

                return undefined;
            }
            return ts.ScriptSnapshot.fromString(sourceFileContainer.addOrGetSourceFileFromFilePathSync(filePath, {
                markInProject: false,
                scriptKind: undefined,
            })!.getFullText());
        },
        getCurrentDirectory: () => transactionalFileSystem.getCurrentDirectory(),
        getDefaultLibFileName: options => {
            return libFolderPath + "/" + ts.getDefaultLibFileName(options);
        },
        isKnownTypesPackageName,
        useCaseSensitiveFileNames: () => true,
        readFile: (path, encoding) => {
            const standardizedPath = transactionalFileSystem.getStandardizedAbsolutePath(path);
            if (libFileMap != null) {
                const libFileText = libFileMap.get(standardizedPath);
                if (libFileText != null)
                    return libFileText;
            }
            if (sourceFileContainer.containsSourceFileAtPath(standardizedPath))
                return sourceFileContainer.getSourceFileFromCacheFromFilePath(standardizedPath)!.getFullText();
            return transactionalFileSystem.readFileSync(standardizedPath, encoding);
        },
        fileExists: filePath => {
            const standardizedFilePath = transactionalFileSystem.getStandardizedAbsolutePath(filePath);
            return fileExistsSync(standardizedFilePath) || libFileMap != null && libFileMap.has(standardizedFilePath);
        },
        directoryExists: dirName => {
            const dirPath = transactionalFileSystem.getStandardizedAbsolutePath(dirName);
            return sourceFileContainer.containsDirectoryAtPath(dirPath)
                || transactionalFileSystem.directoryExistsSync(dirPath);
        },
        resolveModuleNames: resolutionHost.resolveModuleNames,
        resolveTypeReferenceDirectives: resolutionHost.resolveTypeReferenceDirectives,
        getResolvedModuleWithFailedLookupLocationsFromCache: resolutionHost.getResolvedModuleWithFailedLookupLocationsFromCache,
        realpath: path => transactionalFileSystem.realpathSync(transactionalFileSystem.getStandardizedAbsolutePath(path)),
    };

    const compilerHost: ts.CompilerHost = {
        getSourceFile: (fileName: string, languageVersion: ScriptTarget, onError?: (message: string) => void) => {
            const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
            if (libFileMap != null) {
                const libFileText = libFileMap.get(filePath);
                if (libFileText != null) {
                    let sourceFile = sourceFileContainer.getSourceFileFromCacheFromFilePath(filePath);
                    if (sourceFile == null) {
                        sourceFile = sourceFileContainer.addLibFileToCacheByText(
                            filePath,
                            libFileText,
                            ts.ScriptKind.TS,
                        );
                    }
                    return sourceFile;
                }
            }

            // todo: use languageVersion here? But how?
            return sourceFileContainer.addOrGetSourceFileFromFilePathSync(filePath, {
                markInProject: false,
                scriptKind: undefined,
            });
        },
        // getSourceFileByPath: (...) => {}, // not providing these will force it to use the file name as the file path
        // getDefaultLibLocation: (...) => {},
        getDefaultLibFileName: languageServiceHost.getDefaultLibFileName,
        writeFile: (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
            const filePath = transactionalFileSystem.getStandardizedAbsolutePath(fileName);
            transactionalFileSystem.writeFileSync(filePath, writeByteOrderMark ? "\uFEFF" + data : data);
        },
        getCurrentDirectory: () => languageServiceHost.getCurrentDirectory(),
        getDirectories: (path: string) => transactionalFileSystem.getDirectories(transactionalFileSystem.getStandardizedAbsolutePath(path)),
        fileExists: languageServiceHost.fileExists!,
        readFile: languageServiceHost.readFile!,
        getCanonicalFileName: (fileName: string) => transactionalFileSystem.getStandardizedAbsolutePath(fileName),
        useCaseSensitiveFileNames: languageServiceHost.useCaseSensitiveFileNames!,
        getNewLine: languageServiceHost.getNewLine!,
        getEnvironmentVariable: (name: string) => runtime.getEnvVar(name),
        directoryExists: dirName => languageServiceHost.directoryExists!(dirName),
        resolveModuleNames: resolutionHost.resolveModuleNames,
        resolveTypeReferenceDirectives: resolutionHost.resolveTypeReferenceDirectives,
        realpath: languageServiceHost.realpath!,
    };

    return { languageServiceHost, compilerHost };

    function getLibFolderPath() {
        if (options.libFolderPath != null) {
            if (options.skipLoadingLibFiles === true) {
                throw new errors.InvalidOperationError(
                    `Cannot set ${nameof(options, "skipLoadingLibFiles")} to true when ${nameof(options, "libFolderPath")} is provided.`,
                );
            }
            return options.libFolderPath;
        }
        return libFolderInMemoryPath;
    }

    function getLibFileMap() {
        if (options.skipLoadingLibFiles || options.libFolderPath != null)
            return undefined;

        const libFilesMap = new Map<StandardizedFilePath, string>();
        const libFiles = getLibFiles();
        for (const libFile of libFiles) {
            libFilesMap.set(
                transactionalFileSystem.getStandardizedAbsolutePath(libFolderPath + "/" + libFile.fileName),
                libFile.text,
            );
        }

        return libFilesMap;
    }
}
