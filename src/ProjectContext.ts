import { CodeBlockWriter } from "./codeBlockWriter";
import { LanguageService, QuoteKind, TypeChecker, SourceFile, Diagnostic } from "./compiler";
import * as errors from "./errors";
import { CompilerFactory, StructurePrinterFactory } from "./factories";
import { DirectoryCoordinator, FileSystemWrapper } from "./fileSystem";
import { CompilerOptionsContainer, IndentationText, ManipulationSettingsContainer } from "./options";
import { CompilerOptions, ts } from "./typescript";
import { ConsoleLogger, LazyReferenceCoordinator } from "./utils";
import { createWrappedNode } from "./utils/compiler/createWrappedNode";

/**
 * @internal
 */
export interface ProjectContextOptions {
    createLanguageService: boolean;
    typeChecker?: ts.TypeChecker;
}

/**
 * Context for a project instance.
 * @internal
 */
export class ProjectContext {
    private readonly _manipulationSettings = new ManipulationSettingsContainer();
    private readonly _compilerFactory: CompilerFactory;
    private readonly _structurePrinterFactory: StructurePrinterFactory;
    private readonly _lazyReferenceCoordinator: LazyReferenceCoordinator;
    private readonly _directoryCoordinator: DirectoryCoordinator;
    private readonly _languageService: LanguageService | undefined;
    private readonly _fileSystemWrapper: FileSystemWrapper;
    private readonly _compilerOptions = new CompilerOptionsContainer();
    private readonly _customTypeChecker: TypeChecker | undefined;
    private readonly _logger = new ConsoleLogger();

    constructor(fileSystemWrapper: FileSystemWrapper, compilerOptions: CompilerOptions, opts: ProjectContextOptions) {
        this._fileSystemWrapper = fileSystemWrapper;
        this._compilerOptions.set(compilerOptions);
        this._compilerFactory = new CompilerFactory(this);
        this._structurePrinterFactory = new StructurePrinterFactory(() => this.manipulationSettings.getFormatCodeSettings());
        this._lazyReferenceCoordinator = new LazyReferenceCoordinator(this._compilerFactory);
        this._directoryCoordinator = new DirectoryCoordinator(this._compilerFactory, fileSystemWrapper);
        this._languageService = opts.createLanguageService ? new LanguageService(this) : undefined;

        if (opts.typeChecker != null) {
            errors.throwIfTrue(opts.createLanguageService, "Cannot specify a type checker and create a language service.");
            this._customTypeChecker = new TypeChecker(this);
            this._customTypeChecker.reset(() => opts.typeChecker!);
        }
    }

    /** Gets the file system wrapper. */
    get fileSystemWrapper() {
        return this._fileSystemWrapper;
    }

    /** Gets the compiler options. */
    get compilerOptions() {
        return this._compilerOptions;
    }

    /** Gets the manipulation settings. */
    get manipulationSettings() {
        return this._manipulationSettings;
    }

    /** Gets the compiler factory. */
    get compilerFactory() {
        return this._compilerFactory;
    }

    /** Gets the structure printer factory. */
    get structurePrinterFactory() {
        return this._structurePrinterFactory;
    }

    /** Gets the language service. Throws an exception if it doesn't exist. */
    get languageService() {
        if (this._languageService == null)
            throw this.getToolRequiredError("language service");

        return this._languageService;
    }

    /**
     * Gets the program.
     */
    get program() {
        if (this._languageService == null)
            throw this.getToolRequiredError("program");

        return this.languageService.getProgram();
    }

    /**
     * Gets the type checker.
     */
    get typeChecker() {
        if (this._customTypeChecker != null)
            return this._customTypeChecker;
        if (this._languageService == null)
            throw this.getToolRequiredError("type checker");

        return this.program.getTypeChecker();
    }

    /**
     * Gets the logger.
     */
    get logger() {
        return this._logger;
    }

    /** Gets the lazy reference coordinator. */
    get lazyReferenceCoordinator() {
        return this._lazyReferenceCoordinator;
    }

    /** Gets the directory coordinator. */
    get directoryCoordinator() {
        return this._directoryCoordinator;
    }

    /**
     * Gets if this object has a language service.
     */
    hasLanguageService() {
        return this._languageService != null;
    }

    /**
     * Gets the encoding.
     */
    getEncoding() {
        return this.compilerOptions.get().charset || "utf-8";
    }

    /**
     * Helper for getting the format code settings.
     */
    getFormatCodeSettings() {
        return this.manipulationSettings.getFormatCodeSettings();
    }

    /**
     * Helper for getting the user preferences.
     */
    getUserPreferences() {
        return this.manipulationSettings.getUserPreferences();
    }

    /**
     * Resets the program.
     */
    resetProgram() {
        this.languageService.resetProgram();
    }

    /**
     * Creates a code block writer.
     */
    createWriter() {
        const indentationText = this.manipulationSettings.getIndentationText();
        return new CodeBlockWriter({
            newLine: this.manipulationSettings.getNewLineKindAsString(),
            indentNumberOfSpaces: indentationText === IndentationText.Tab ? undefined : indentationText.length,
            useTabs: indentationText === IndentationText.Tab,
            useSingleQuote: this.manipulationSettings.getQuoteKind() === QuoteKind.Single
        });
    }

    /**
     * Gets the pre-emit diagnostics.
     * @param sourceFile - Optional source file to filter the results by.
     */
    getPreEmitDiagnostics(sourceFile?: SourceFile): Diagnostic[] {
        const compilerDiagnostics = ts.getPreEmitDiagnostics(this.program.compilerObject, sourceFile == null ? undefined : sourceFile.compilerNode);
        return compilerDiagnostics.map(d => this.compilerFactory.getDiagnostic(d));
    }

    private getToolRequiredError(name: string) {
        return new errors.InvalidOperationError(`A ${name} is required for this operation. ` +
            "This might occur when manipulating or getting type information from a node that was not added " +
            `to a Project object and created via ${nameof(createWrappedNode)}. ` +
            `Please submit a bug report if you don't believe a ${name} should be required for this operation.`);
    }
}
