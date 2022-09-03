import { DocumentRegistry, StringUtils, ts, FileUtils, TransactionalFileSystem, TsConfigResolver, errors, InMemoryFileSystemHost, RealFileSystemHost, CompilerOptionsContainer, createHosts, runtime, createModuleResolutionHost, Memoize } from '../common/mod.ts';
export { CompilerOptionsContainer, InMemoryFileSystemHost, ResolutionHosts, SettingsContainer, ts } from '../common/mod.ts';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

class SourceFileCache {
    constructor(fileSystemWrapper, compilerOptions) {
        this.fileSystemWrapper = fileSystemWrapper;
        this.compilerOptions = compilerOptions;
        this.sourceFilesByFilePath = new Map();
        this.projectVersion = 0;
        this.documentRegistry = new DocumentRegistry(fileSystemWrapper);
    }
    containsSourceFileAtPath(filePath) {
        return this.sourceFilesByFilePath.has(filePath);
    }
    getSourceFilePaths() {
        return this.sourceFilesByFilePath.keys();
    }
    getSourceFiles() {
        return this.sourceFilesByFilePath.values();
    }
    getProjectVersion() {
        return this.projectVersion;
    }
    getSourceFileVersion(sourceFile) {
        return this.documentRegistry.getSourceFileVersion(sourceFile);
    }
    getSourceFileFromCacheFromFilePath(filePath) {
        return this.sourceFilesByFilePath.get(filePath);
    }
    async addOrGetSourceFileFromFilePath(filePath, options) {
        let sourceFile = this.sourceFilesByFilePath.get(filePath);
        if (sourceFile == null) {
            const fileText = await this.fileSystemWrapper.readFileIfExists(filePath, this.compilerOptions.getEncoding());
            if (fileText != null) {
                sourceFile = this.createSourceFileFromText(filePath, fileText, options);
            }
        }
        return sourceFile;
    }
    addOrGetSourceFileFromFilePathSync(filePath, options) {
        let sourceFile = this.sourceFilesByFilePath.get(filePath);
        if (sourceFile == null) {
            const fileText = this.fileSystemWrapper.readFileIfExistsSync(filePath, this.compilerOptions.getEncoding());
            if (fileText != null) {
                sourceFile = this.createSourceFileFromText(filePath, fileText, options);
            }
        }
        return sourceFile;
    }
    createSourceFileFromText(filePath, text, options) {
        filePath = this.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        const hasBom = StringUtils.hasBom(text);
        if (hasBom)
            text = StringUtils.stripBom(text);
        const sourceFile = this.documentRegistry.createOrUpdateSourceFile(filePath, this.compilerOptions.get(), ts.ScriptSnapshot.fromString(text), options.scriptKind);
        this.setSourceFile(sourceFile);
        return sourceFile;
    }
    setSourceFile(sourceFile) {
        const standardizedFilePath = this.fileSystemWrapper.getStandardizedAbsolutePath(sourceFile.fileName);
        sourceFile.fileName = standardizedFilePath;
        this.documentRegistry.updateDocument(standardizedFilePath, this.compilerOptions.get(), ts.ScriptSnapshot.fromString(sourceFile.text), this.getSourceFileVersion(sourceFile), sourceFile["scriptKind"]);
        const dirPath = FileUtils.getDirPath(standardizedFilePath);
        if (!this.fileSystemWrapper.directoryExistsSync(dirPath))
            this.fileSystemWrapper.queueMkdir(dirPath);
        this.sourceFilesByFilePath.set(standardizedFilePath, sourceFile);
        this.projectVersion++;
    }
    removeSourceFile(filePath) {
        this.sourceFilesByFilePath.delete(filePath);
    }
    containsDirectoryAtPath(dirPath) {
        return this.fileSystemWrapper.directoryExistsSync(dirPath);
    }
    getChildDirectoriesOfDirectory(dirPath) {
        return this.fileSystemWrapper.getDirectories(dirPath);
    }
}

async function createProject(options = {}) {
    const { project, tsConfigResolver } = createProjectCommon(options);
    if (tsConfigResolver != null && options.skipAddingFilesFromTsConfig !== true) {
        await project._addSourceFilesForTsConfigResolver(tsConfigResolver, project.compilerOptions.get());
        if (!options.skipFileDependencyResolution)
            project.resolveSourceFileDependencies();
    }
    return project;
}
function createProjectSync(options = {}) {
    const { project, tsConfigResolver } = createProjectCommon(options);
    if (tsConfigResolver != null && options.skipAddingFilesFromTsConfig !== true) {
        project._addSourceFilesForTsConfigResolverSync(tsConfigResolver, project.compilerOptions.get());
        if (!options.skipFileDependencyResolution)
            project.resolveSourceFileDependencies();
    }
    return project;
}
function createProjectCommon(options) {
    verifyOptions();
    const fileSystem = getFileSystem();
    const fileSystemWrapper = new TransactionalFileSystem({
        fileSystem,
        libFolderPath: options.libFolderPath,
        skipLoadingLibFiles: options.skipLoadingLibFiles,
    });
    const tsConfigResolver = options.tsConfigFilePath == null
        ? undefined
        : new TsConfigResolver(fileSystemWrapper, fileSystemWrapper.getStandardizedAbsolutePath(options.tsConfigFilePath), getEncodingFromProvidedOptions());
    const project = new Project({
        fileSystem,
        fileSystemWrapper,
        tsConfigResolver,
    }, options);
    return { project, tsConfigResolver };
    function verifyOptions() {
        if (options.fileSystem != null && options.useInMemoryFileSystem)
            throw new errors.InvalidOperationError("Cannot provide a file system when specifying to use an in-memory file system.");
    }
    function getFileSystem() {
        var _a;
        if (options.useInMemoryFileSystem)
            return new InMemoryFileSystemHost();
        return (_a = options.fileSystem) !== null && _a !== void 0 ? _a : new RealFileSystemHost();
    }
    function getEncodingFromProvidedOptions() {
        const defaultEncoding = "utf-8";
        if (options.compilerOptions != null)
            return options.compilerOptions.charset || defaultEncoding;
        return defaultEncoding;
    }
}
class Project {
    constructor(objs, options) {
        var _a;
        const { tsConfigResolver } = objs;
        this.fileSystem = objs.fileSystem;
        this._fileSystemWrapper = objs.fileSystemWrapper;
        const tsCompilerOptions = getCompilerOptions();
        this.compilerOptions = new CompilerOptionsContainer();
        this.compilerOptions.set(tsCompilerOptions);
        this._sourceFileCache = new SourceFileCache(this._fileSystemWrapper, this.compilerOptions);
        const resolutionHost = !options.resolutionHost
            ? undefined
            : options.resolutionHost(this.getModuleResolutionHost(), () => this.compilerOptions.get());
        const newLineKind = "\n";
        const { languageServiceHost, compilerHost } = createHosts({
            transactionalFileSystem: this._fileSystemWrapper,
            sourceFileContainer: this._sourceFileCache,
            compilerOptions: this.compilerOptions,
            getNewLine: () => newLineKind,
            resolutionHost: resolutionHost || {},
            getProjectVersion: () => this._sourceFileCache.getProjectVersion().toString(),
            isKnownTypesPackageName: options.isKnownTypesPackageName,
            libFolderPath: options.libFolderPath,
            skipLoadingLibFiles: options.skipLoadingLibFiles,
        });
        this.languageServiceHost = languageServiceHost;
        this.compilerHost = compilerHost;
        this.configFileParsingDiagnostics = (_a = tsConfigResolver === null || tsConfigResolver === void 0 ? void 0 : tsConfigResolver.getErrors()) !== null && _a !== void 0 ? _a : [];
        function getCompilerOptions() {
            return {
                ...getTsConfigCompilerOptions(),
                ...(options.compilerOptions || {}),
            };
        }
        function getTsConfigCompilerOptions() {
            if (tsConfigResolver == null)
                return {};
            return tsConfigResolver.getCompilerOptions();
        }
    }
    async addSourceFileAtPath(filePath, options) {
        const sourceFile = await this.addSourceFileAtPathIfExists(filePath, options);
        if (sourceFile == null)
            throw new errors.FileNotFoundError(this._fileSystemWrapper.getStandardizedAbsolutePath(filePath));
        return sourceFile;
    }
    addSourceFileAtPathSync(filePath, options) {
        const sourceFile = this.addSourceFileAtPathIfExistsSync(filePath, options);
        if (sourceFile == null)
            throw new errors.FileNotFoundError(this._fileSystemWrapper.getStandardizedAbsolutePath(filePath));
        return sourceFile;
    }
    addSourceFileAtPathIfExists(filePath, options) {
        return this._sourceFileCache.addOrGetSourceFileFromFilePath(this._fileSystemWrapper.getStandardizedAbsolutePath(filePath), {
            scriptKind: options && options.scriptKind,
        });
    }
    addSourceFileAtPathIfExistsSync(filePath, options) {
        return this._sourceFileCache.addOrGetSourceFileFromFilePathSync(this._fileSystemWrapper.getStandardizedAbsolutePath(filePath), {
            scriptKind: options && options.scriptKind,
        });
    }
    async addSourceFilesByPaths(fileGlobs) {
        if (typeof fileGlobs === "string")
            fileGlobs = [fileGlobs];
        const sourceFilePromises = [];
        const sourceFiles = [];
        for await (const filePath of this._fileSystemWrapper.glob(fileGlobs)) {
            sourceFilePromises.push(this.addSourceFileAtPathIfExists(filePath).then(sourceFile => {
                if (sourceFile != null)
                    sourceFiles.push(sourceFile);
            }));
        }
        await Promise.all(sourceFilePromises);
        return sourceFiles;
    }
    addSourceFilesByPathsSync(fileGlobs) {
        if (typeof fileGlobs === "string")
            fileGlobs = [fileGlobs];
        const sourceFiles = [];
        for (const filePath of this._fileSystemWrapper.globSync(fileGlobs)) {
            const sourceFile = this.addSourceFileAtPathIfExistsSync(filePath);
            if (sourceFile != null)
                sourceFiles.push(sourceFile);
        }
        return sourceFiles;
    }
    addSourceFilesFromTsConfig(tsConfigFilePath) {
        const resolver = this._getTsConfigResolover(tsConfigFilePath);
        return this._addSourceFilesForTsConfigResolver(resolver, resolver.getCompilerOptions());
    }
    addSourceFilesFromTsConfigSync(tsConfigFilePath) {
        const resolver = this._getTsConfigResolover(tsConfigFilePath);
        return this._addSourceFilesForTsConfigResolverSync(resolver, resolver.getCompilerOptions());
    }
    _getTsConfigResolover(tsConfigFilePath) {
        const standardizedFilePath = this._fileSystemWrapper.getStandardizedAbsolutePath(tsConfigFilePath);
        return new TsConfigResolver(this._fileSystemWrapper, standardizedFilePath, this.compilerOptions.getEncoding());
    }
    createSourceFile(filePath, sourceFileText, options) {
        return this._sourceFileCache.createSourceFileFromText(this._fileSystemWrapper.getStandardizedAbsolutePath(filePath), sourceFileText || "", { scriptKind: options && options.scriptKind });
    }
    updateSourceFile(filePathOrSourceFile, sourceFileText, options) {
        if (typeof filePathOrSourceFile === "string")
            return this.createSourceFile(filePathOrSourceFile, sourceFileText, options);
        incrementVersion(filePathOrSourceFile);
        ensureScriptSnapshot(filePathOrSourceFile);
        return this._sourceFileCache.setSourceFile(filePathOrSourceFile);
        function incrementVersion(sourceFile) {
            let version = sourceFile.version || "-1";
            const parsedVersion = parseInt(version, 10);
            if (isNaN(parsedVersion))
                version = "0";
            else
                version = (parsedVersion + 1).toString();
            sourceFile.version = version;
        }
        function ensureScriptSnapshot(sourceFile) {
            if (sourceFile.scriptSnapshot == null)
                sourceFile.scriptSnapshot = ts.ScriptSnapshot.fromString(sourceFile.text);
        }
    }
    removeSourceFile(filePathOrSourceFile) {
        this._sourceFileCache.removeSourceFile(this._fileSystemWrapper.getStandardizedAbsolutePath(typeof filePathOrSourceFile === "string" ? filePathOrSourceFile : filePathOrSourceFile.fileName));
    }
    resolveSourceFileDependencies() {
        this.createProgram();
    }
    async _addSourceFilesForTsConfigResolver(tsConfigResolver, compilerOptions) {
        const sourceFiles = [];
        await Promise.all(tsConfigResolver.getPaths(compilerOptions).filePaths
            .map(p => this.addSourceFileAtPath(p).then(s => sourceFiles.push(s))));
        return sourceFiles;
    }
    _addSourceFilesForTsConfigResolverSync(tsConfigResolver, compilerOptions) {
        return tsConfigResolver.getPaths(compilerOptions).filePaths.map(p => this.addSourceFileAtPathSync(p));
    }
    createProgram(options) {
        const oldProgram = this._oldProgram;
        const program = ts.createProgram({
            rootNames: Array.from(this._sourceFileCache.getSourceFilePaths()),
            options: this.compilerOptions.get(),
            host: this.compilerHost,
            oldProgram,
            configFileParsingDiagnostics: this.configFileParsingDiagnostics,
            ...options,
        });
        this._oldProgram = program;
        return program;
    }
    getLanguageService() {
        return ts.createLanguageService(this.languageServiceHost, this._sourceFileCache.documentRegistry);
    }
    getSourceFileOrThrow(fileNameOrSearchFunction) {
        const sourceFile = this.getSourceFile(fileNameOrSearchFunction);
        if (sourceFile != null)
            return sourceFile;
        if (typeof fileNameOrSearchFunction === "string") {
            const fileNameOrPath = FileUtils.standardizeSlashes(fileNameOrSearchFunction);
            if (FileUtils.pathIsAbsolute(fileNameOrPath) || fileNameOrPath.indexOf("/") >= 0) {
                const errorFileNameOrPath = this._fileSystemWrapper.getStandardizedAbsolutePath(fileNameOrPath);
                throw new errors.InvalidOperationError(`Could not find source file in project at the provided path: ${errorFileNameOrPath}`);
            }
            else {
                throw new errors.InvalidOperationError(`Could not find source file in project with the provided file name: ${fileNameOrSearchFunction}`);
            }
        }
        else {
            throw new errors.InvalidOperationError(`Could not find source file in project based on the provided condition.`);
        }
    }
    getSourceFile(fileNameOrSearchFunction) {
        const filePathOrSearchFunction = getFilePathOrSearchFunction(this._fileSystemWrapper);
        if (isStandardizedFilePath(filePathOrSearchFunction)) {
            return this._sourceFileCache.getSourceFileFromCacheFromFilePath(filePathOrSearchFunction);
        }
        const allSoureFilesIterable = this.getSourceFiles();
        return selectSmallestDirPathResult(function* () {
            for (const sourceFile of allSoureFilesIterable) {
                if (filePathOrSearchFunction(sourceFile))
                    yield sourceFile;
            }
        }());
        function getFilePathOrSearchFunction(fileSystemWrapper) {
            if (fileNameOrSearchFunction instanceof Function)
                return fileNameOrSearchFunction;
            const fileNameOrPath = FileUtils.standardizeSlashes(fileNameOrSearchFunction);
            if (FileUtils.pathIsAbsolute(fileNameOrPath) || fileNameOrPath.indexOf("/") >= 0)
                return fileSystemWrapper.getStandardizedAbsolutePath(fileNameOrPath);
            else
                return def => FileUtils.pathEndsWith(def.fileName, fileNameOrPath);
        }
        function selectSmallestDirPathResult(results) {
            let result;
            for (const sourceFile of results) {
                if (result == null || FileUtils.getDirPath(sourceFile.fileName).length < FileUtils.getDirPath(result.fileName).length)
                    result = sourceFile;
            }
            return result;
        }
        function isStandardizedFilePath(obj) {
            return typeof obj === "string";
        }
    }
    getSourceFiles() {
        return Array.from(this._sourceFileCache.getSourceFiles());
    }
    formatDiagnosticsWithColorAndContext(diagnostics, opts = {}) {
        return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCurrentDirectory: () => this._fileSystemWrapper.getCurrentDirectory(),
            getCanonicalFileName: fileName => fileName,
            getNewLine: () => opts.newLineChar || runtime.getEndOfLine(),
        });
    }
    getModuleResolutionHost() {
        return createModuleResolutionHost({
            transactionalFileSystem: this._fileSystemWrapper,
            getEncoding: () => this.compilerOptions.getEncoding(),
            sourceFileContainer: this._sourceFileCache,
        });
    }
}
__decorate([
    Memoize
], Project.prototype, "getLanguageService", null);
__decorate([
    Memoize
], Project.prototype, "getModuleResolutionHost", null);

export { Project, createProject, createProjectSync };
