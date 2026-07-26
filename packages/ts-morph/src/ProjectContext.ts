import { CompilerOptionsContainer, createModuleResolutionHost, errors, TransactionalFileSystem, ts } from "@ts-morph/common";
import { CodeBlockWriter } from "./codeBlockWriter";
import { Diagnostic, LanguageService, QuoteKind, SourceFile, TypeChecker } from "./compiler";
import { CompilerFactory, InProjectCoordinator, StructurePrinterFactory } from "./factories";
import { DirectoryCoordinator } from "./fileSystem";
import { IndentationText, ManipulationSettingsContainer } from "./options";
import { Project } from "./Project";
import { ConsoleLogger, LazyReferenceCoordinator } from "./utils";
import { createWrappedNode } from "./utils/compiler/createWrappedNode";

/** @internal */
export interface ProjectContextCreationParams {
  project: Project | undefined;
  fileSystemWrapper: TransactionalFileSystem;
  compilerOptionsContainer: CompilerOptionsContainer;
  configFileParsingDiagnostics: ts.Diagnostic[];
  createLanguageService: boolean;
  typeChecker?: ts.TypeChecker;
  skipLoadingLibFiles: boolean | undefined;
  libFolderPath: string | undefined;
}

/**
 * Context for a project instance.
 * @internal
 */
export class ProjectContext {
  readonly #languageService: LanguageService | undefined;
  readonly #compilerOptions: CompilerOptionsContainer;
  readonly #customTypeChecker: TypeChecker | undefined;
  readonly #project: Project | undefined;
  #moduleResolutionHost: ts.ModuleResolutionHost | undefined;

  get project(): Project {
    if (this.#project == null)
      throw new errors.InvalidOperationError("This operation is not permitted in this context.");
    return this.#project;
  }

  readonly logger = new ConsoleLogger();
  readonly lazyReferenceCoordinator: LazyReferenceCoordinator;
  readonly directoryCoordinator: DirectoryCoordinator;
  readonly fileSystemWrapper: TransactionalFileSystem;
  readonly manipulationSettings = new ManipulationSettingsContainer();
  readonly structurePrinterFactory: StructurePrinterFactory;
  readonly compilerFactory: CompilerFactory;
  readonly inProjectCoordinator: InProjectCoordinator;
  /** Whether the project was asked not to make the lib files available. */
  readonly skipLoadingLibFiles: boolean | undefined;
  /** Folder the lib files are read from, when the project named one. */
  readonly libFolderPath: string | undefined;

  constructor(params: ProjectContextCreationParams) {
    this.#project = params.project;
    this.fileSystemWrapper = params.fileSystemWrapper;
    this.#compilerOptions = params.compilerOptionsContainer;
    this.skipLoadingLibFiles = params.skipLoadingLibFiles;
    this.libFolderPath = params.libFolderPath;
    this.compilerFactory = new CompilerFactory(this);
    this.inProjectCoordinator = new InProjectCoordinator(this.compilerFactory);
    this.structurePrinterFactory = new StructurePrinterFactory(() => this.manipulationSettings.getFormatCodeSettings());
    this.lazyReferenceCoordinator = new LazyReferenceCoordinator(this.compilerFactory);
    this.directoryCoordinator = new DirectoryCoordinator(this.compilerFactory, params.fileSystemWrapper);
    this.#languageService = params.createLanguageService
      ? new LanguageService({
        context: this,
        configFileParsingDiagnostics: params.configFileParsingDiagnostics,
        skipLoadingLibFiles: params.skipLoadingLibFiles,
        libFolderPath: params.libFolderPath,
      })
      : undefined;

    if (params.typeChecker != null) {
      errors.throwIfTrue(params.createLanguageService, "Cannot specify a type checker and create a language service.");
      this.#customTypeChecker = new TypeChecker(this);
      this.#customTypeChecker._reset(() => params.typeChecker!);
    }
  }

  /** Gets the compiler options. */
  get compilerOptions() {
    return this.#compilerOptions;
  }

  /** Gets the language service. Throws an exception if it doesn't exist. */
  get languageService() {
    if (this.#languageService == null)
      throw this.#getToolRequiredError("language service");

    return this.#languageService;
  }

  /**
   * Gets the program.
   */
  get program() {
    if (this.#languageService == null)
      throw this.#getToolRequiredError("program");

    return this.languageService.getProgram();
  }

  /**
   * Gets the type checker.
   */
  get typeChecker() {
    if (this.#customTypeChecker != null)
      return this.#customTypeChecker;
    if (this.#languageService == null)
      throw this.#getToolRequiredError("type checker");

    return this.program.getTypeChecker();
  }

  /**
   * Gets if this object has a language service.
   */
  hasLanguageService() {
    return this.#languageService != null;
  }

  /**
   * Gets the encoding.
   */
  getEncoding() {
    return this.compilerOptions.getEncoding();
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
    this.languageService._reset();
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
      useSingleQuote: this.manipulationSettings.getQuoteKind() === QuoteKind.Single,
    });
  }

  /**
   * Gets the pre-emit diagnostics.
   * @param sourceFile - Optional source file to filter the results by.
   */
  getPreEmitDiagnostics(sourceFile?: SourceFile): Diagnostic[] {
    // tsgo has no `getPreEmitDiagnostics`; the adapter assembles it out of every
    // category the compiler reports before an emit.
    const compilerDiagnostics = ts.getPreEmitDiagnostics(this.program.compilerObject, sourceFile?.compilerNode);
    return compilerDiagnostics.map(d => this.compilerFactory.getDiagnostic(d));
  }

  /**
   * Gets a module resolution host that answers out of the project first and the file
   * system second.
   */
  getModuleResolutionHost(): ts.ModuleResolutionHost {
    return this.#moduleResolutionHost ??= createModuleResolutionHost({
      transactionalFileSystem: this.fileSystemWrapper,
      getEncoding: () => this.getEncoding(),
      sourceFileContainer: {
        containsDirectoryAtPath: dirPath => this.compilerFactory.containsDirectoryAtPath(dirPath),
        containsSourceFileAtPath: filePath => this.compilerFactory.containsSourceFileAtPath(filePath),
        getSourceFileFromCacheFromFilePath: filePath => this.compilerFactory.getSourceFileFromCacheFromFilePath(filePath),
        getChildDirectoriesOfDirectory: dirPath => Array.from(this.compilerFactory.getChildDirectoriesOfDirectory(dirPath), d => d.getPath()),
      },
    });
  }

  #getToolRequiredError(name: string) {
    return new errors.InvalidOperationError(
      `A ${name} is required for this operation. `
        + "This might occur when manipulating or getting type information from a node that was not added "
        + `to a Project object and created via createWrappedNode. `
        + `Please submit a bug report if you don't believe a ${name} should be required for this operation.`,
    );
  }
}
