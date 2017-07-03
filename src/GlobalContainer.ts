import * as ts from "typescript";
import * as errors from "./errors";
import {ManipulationSettingsContainer} from "./manipulation";
import {CompilerFactory} from "./factories";
import {LanguageService} from "./compiler";
import {createWrappedNode} from "./createWrappedNode";
import {FileSystemHost} from "./FileSystemHost";

/**
 * Global container.
 * @internal
 */
export class GlobalContainer {
    private readonly _manipulationSettings = new ManipulationSettingsContainer();
    private readonly _compilerFactory: CompilerFactory;
    private readonly _languageService: LanguageService | undefined;
    private readonly _fileSystem: FileSystemHost;
    private readonly _compilerOptions: ts.CompilerOptions;

    constructor(fileSystem: FileSystemHost, compilerOptions: ts.CompilerOptions, createLanguageService: boolean) {
        this._fileSystem = fileSystem;
        this._compilerOptions = compilerOptions;
        this._compilerFactory = new CompilerFactory(this);
        this._languageService = createLanguageService ? new LanguageService(this) : undefined;

        if (this._languageService != null) {
            this.compilerFactory.onSourceFileAdded(args => {
                this._languageService!.addSourceFile(args.addedSourceFile);
            });
        }
    }

    /** Gets the file system. */
    get fileSystem() {
        return this._fileSystem;
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

    /** Gets the language service. Throws an exception if it doesn't exist. */
    get languageService() {
        if (this._languageService == null) {
            throw new errors.InvalidOperationError("A language service is required for this operation. " +
                "This might occur when manipulating or getting type information from a node that was not added " +
                `to a TsSimpleAst object and created via ${nameof(createWrappedNode)}. ` +
                "Please submit a bug report if you don't believe a language service should be required for this operation.");
        }
        return this._languageService;
    }

    /**
     * Gets the program.
     */
    get program() {
        return this.languageService.getProgram();
    }

    /**
     * Gets the type checker.
     */
    get typeChecker() {
        return this.program.getTypeChecker();
    }

    /**
     * Gets if this object has a language service.
     */
    hasLanguageService() {
        return this._languageService != null;
    }

    /**
     * Resets the program.
     */
    resetProgram() {
        this.languageService.resetProgram();
    }
}
