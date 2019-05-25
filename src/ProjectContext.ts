import { CodeBlockWriter } from "./codeBlockWriter";
import { LanguageService, QuoteKind, TypeChecker, SourceFile, Diagnostic, ResolutionHost } from "./compiler";
import * as errors from "./errors";
import { CompilerFactory, StructurePrinterFactory, InProjectCoordinator } from "./factories";
import { DirectoryCoordinator, FileSystemWrapper } from "./fileSystem";
import { CompilerOptionsContainer, IndentationText, ManipulationSettingsContainer } from "./options";
import { CompilerOptions, ts } from "./typescript";
import { ConsoleLogger, LazyReferenceCoordinator } from "./utils";
import { Project } from "./Project";
import { createWrappedNode } from "./utils/compiler/createWrappedNode";

/**
 * @internal
 */
export interface ProjectContextOptions {
    createLanguageService: boolean;
    resolutionHost?: ResolutionHost;
    typeChecker?: ts.TypeChecker;
}

/**
 * Context for a project instance.
 * @internal
 */
export class ProjectContext {
    private readonly _languageService: LanguageService | undefined;
    private readonly _compilerOptions = new CompilerOptionsContainer();
    private readonly _customTypeChecker: TypeChecker | undefined;
    private readonly _project: Project | undefined;

    get project(): Project {
        if (this._project == null)
            throw new errors.InvalidOperationError("This operation is not permitted in this context.");
        return this._project;
    }

    readonly logger = new ConsoleLogger();
    readonly lazyReferenceCoordinator: LazyReferenceCoordinator;
    readonly directoryCoordinator: DirectoryCoordinator;
    readonly fileSystemWrapper: FileSystemWrapper;
    readonly manipulationSettings = new ManipulationSettingsContainer();
    readonly structurePrinterFactory: StructurePrinterFactory;
    readonly compilerFactory: CompilerFactory;
    readonly inProjectCoordinator: InProjectCoordinator;

    constructor(project: Project | undefined, fileSystemWrapper: FileSystemWrapper, compilerOptions: CompilerOptions, opts: ProjectContextOptions) {
        this._project = project;
        this.fileSystemWrapper = fileSystemWrapper;
        this._compilerOptions.set(compilerOptions);
        this.compilerFactory = new CompilerFactory(this);
        this.inProjectCoordinator = new InProjectCoordinator(this.compilerFactory);
        this.structurePrinterFactory = new StructurePrinterFactory(() => this.manipulationSettings.getFormatCodeSettings());
        this.lazyReferenceCoordinator = new LazyReferenceCoordinator(this.compilerFactory);
        this.directoryCoordinator = new DirectoryCoordinator(this.compilerFactory, fileSystemWrapper);
        this._languageService = opts.createLanguageService ? new LanguageService(this, { resolutionHost: opts.resolutionHost }) : undefined;

        if (opts.typeChecker != null) {
            errors.throwIfTrue(opts.createLanguageService, "Cannot specify a type checker and create a language service.");
            this._customTypeChecker = new TypeChecker(this);
            this._customTypeChecker._reset(() => opts.typeChecker!);
        }
    }

    /** Gets the compiler options. */
    get compilerOptions() {
        return this._compilerOptions;
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
        this.languageService._resetProgram();
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
