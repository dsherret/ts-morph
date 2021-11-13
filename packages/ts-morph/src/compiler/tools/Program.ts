import { errors, getEmitModuleResolutionKind, ModuleResolutionKind, ts } from "@ts-morph/common";
import { ProjectContext } from "../../ProjectContext";
import { SourceFile } from "../ast/module";
import { Diagnostic, DiagnosticWithLocation, EmitResult, MemoryEmitResult, MemoryEmitResultFile } from "./results";
import { TypeChecker } from "./TypeChecker";

/**
 * Options for emitting from a Program.
 */
export interface ProgramEmitOptions extends EmitOptions {
    writeFile?: ts.WriteFileCallback;
}

/**
 * Options for emitting.
 */
export interface EmitOptions extends EmitOptionsBase {
    /**
     * Optional source file to only emit.
     */
    targetSourceFile?: SourceFile;
}

export interface EmitOptionsBase {
    /**
     * Whether only .d.ts files should be emitted.
     */
    emitOnlyDtsFiles?: boolean;
    /**
     * Transformers to act on the files when emitting.
     */
    customTransformers?: ts.CustomTransformers;
}

/** @internal */
export interface ProgramCreationData {
    context: ProjectContext;
    rootNames: ReadonlyArray<string>;
    host: ts.CompilerHost;
    configFileParsingDiagnostics: ts.Diagnostic[];
}

/**
 * Wrapper around Program.
 */
export class Program {
    /** @internal */
    private readonly _context: ProjectContext;
    /** @internal */
    private readonly _typeChecker: TypeChecker;
    /** @internal */
    private _createdCompilerObject: ts.Program | undefined;
    /** @internal */
    private _oldProgram: ts.Program | undefined;
    /** @internal */
    private _getOrCreateCompilerObject!: () => ts.Program;
    /** @internal */
    private _configFileParsingDiagnostics: ts.Diagnostic[];

    /** @private */
    constructor(opts: ProgramCreationData) {
        this._context = opts.context;
        this._configFileParsingDiagnostics = opts.configFileParsingDiagnostics;
        this._typeChecker = new TypeChecker(this._context);
        this._reset(opts.rootNames, opts.host);
    }

    /**
     * Gets the underlying compiler program.
     */
    get compilerObject() {
        return this._getOrCreateCompilerObject();
    }

    /**
     * Gets if the internal compiler program is created.
     * @internal
     */
    _isCompilerProgramCreated() {
        return this._createdCompilerObject != null;
    }

    /**
     * Resets the program.
     * @internal
     */
    _reset(rootNames: ReadonlyArray<string>, host: ts.CompilerHost) {
        const compilerOptions = this._context.compilerOptions.get();
        this._getOrCreateCompilerObject = () => {
            // need to use ts.createProgram instead of languageService.getProgram() because the
            // program created by the language service is not fully featured (ex. does not write to the file system)
            if (this._createdCompilerObject == null) {
                this._createdCompilerObject = ts.createProgram(
                    rootNames,
                    compilerOptions,
                    host,
                    this._oldProgram,
                    this._configFileParsingDiagnostics,
                );
                delete this._oldProgram;
            }

            return this._createdCompilerObject;
        };

        if (this._createdCompilerObject != null) {
            this._oldProgram = this._createdCompilerObject;
            delete this._createdCompilerObject;
        }

        this._typeChecker._reset(() => this.compilerObject.getTypeChecker());
    }

    /**
     * Get the program's type checker.
     */
    getTypeChecker() {
        return this._typeChecker;
    }

    /**
     * Asynchronously emits the TypeScript files as JavaScript files.
     * @param options - Options for emitting.
     */
    async emit(options: ProgramEmitOptions = {}) {
        if (options.writeFile) {
            const message = `Cannot specify a ${nameof.property(options, "writeFile")} option when emitting asynchrously. `
                + `Use ${nameof.property(this, "emitSync")}() instead.`;
            throw new errors.InvalidOperationError(message);
        }

        const { fileSystemWrapper } = this._context;
        const promises: Promise<void>[] = [];
        const emitResult = this._emit({
            writeFile: (filePath, text, writeByteOrderMark) => {
                promises
                    .push(fileSystemWrapper.writeFile(fileSystemWrapper.getStandardizedAbsolutePath(filePath), writeByteOrderMark ? "\uFEFF" + text : text));
            },
            ...options,
        });
        await Promise.all(promises);
        return new EmitResult(this._context, emitResult);
    }

    /**
     * Synchronously emits the TypeScript files as JavaScript files.
     * @param options - Options for emitting.
     * @remarks Use `emit()` as the asynchronous version will be much faster.
     */
    emitSync(options: ProgramEmitOptions = {}) {
        return new EmitResult(this._context, this._emit(options));
    }

    /**
     * Emits the TypeScript files to JavaScript files to memory.
     * @param options - Options for emitting.
     */
    emitToMemory(options: EmitOptions = {}) {
        const sourceFiles: MemoryEmitResultFile[] = [];
        const { fileSystemWrapper } = this._context;
        const emitResult = this._emit({
            writeFile: (filePath, text, writeByteOrderMark) => {
                sourceFiles.push({
                    filePath: fileSystemWrapper.getStandardizedAbsolutePath(filePath),
                    text,
                    writeByteOrderMark: writeByteOrderMark || false,
                });
            },
            ...options,
        });
        return new MemoryEmitResult(this._context, emitResult, sourceFiles);
    }

    /** @internal */
    private _emit(options: ProgramEmitOptions = {}) {
        const targetSourceFile = options.targetSourceFile != null ? options.targetSourceFile.compilerNode : undefined;
        const { emitOnlyDtsFiles, customTransformers, writeFile } = options;
        const cancellationToken = undefined; // todo: expose this
        return this.compilerObject.emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, customTransformers);
    }

    /**
     * Gets the syntactic diagnostics.
     * @param sourceFile - Optional source file to filter by.
     */
    getSyntacticDiagnostics(sourceFile?: SourceFile): DiagnosticWithLocation[] {
        const compilerDiagnostics = this.compilerObject.getSyntacticDiagnostics(sourceFile == null ? undefined : sourceFile.compilerNode);
        return compilerDiagnostics.map(d => this._context.compilerFactory.getDiagnosticWithLocation(d));
    }

    /**
     * Gets the semantic diagnostics.
     * @param sourceFile - Optional source file to filter by.
     */
    getSemanticDiagnostics(sourceFile?: SourceFile): Diagnostic[] {
        const compilerDiagnostics = this.compilerObject.getSemanticDiagnostics(sourceFile?.compilerNode);
        return compilerDiagnostics.map(d => this._context.compilerFactory.getDiagnostic(d));
    }

    /**
     * Gets the declaration diagnostics.
     * @param sourceFile - Optional source file to filter by.
     */
    getDeclarationDiagnostics(sourceFile?: SourceFile): DiagnosticWithLocation[] {
        const compilerDiagnostics = this.compilerObject.getDeclarationDiagnostics(sourceFile?.compilerNode);
        return compilerDiagnostics.map(d => this._context.compilerFactory.getDiagnosticWithLocation(d));
    }

    /**
     * Gets the global diagnostics.
     */
    getGlobalDiagnostics(): Diagnostic[] {
        const compilerDiagnostics = this.compilerObject.getGlobalDiagnostics();
        return compilerDiagnostics.map(d => this._context.compilerFactory.getDiagnostic(d));
    }

    /**
     * Gets the diagnostics found when parsing the tsconfig.json file.
     */
    getConfigFileParsingDiagnostics(): Diagnostic[] {
        const compilerDiagnostics = this.compilerObject.getConfigFileParsingDiagnostics();
        return compilerDiagnostics.map(d => this._context.compilerFactory.getDiagnostic(d));
    }

    /**
     * Gets the emit module resolution kind.
     */
    getEmitModuleResolutionKind(): ModuleResolutionKind {
        return getEmitModuleResolutionKind(this.compilerObject.getCompilerOptions());
    }

    /**
     * Gets if the provided source file was discovered while loading an external library.
     * @param sourceFile - Source file.
     */
    isSourceFileFromExternalLibrary(sourceFile: SourceFile) {
        // Do not use compilerObject.isSourceFileFromExternalLibrary because that method
        // will become out of date after a manipulation has happened to a source file.
        // Read more in sourceFile.isFromExternalLibrary()'s method body.
        return sourceFile.isFromExternalLibrary();
    }
}
