import * as ts from "typescript";
import {SourceFile} from "./../../compiler";
import {CompilerFactory} from "./../../factories";
import {DiagnosticMessageChain} from "./DiagnosticMessageChain";

/**
 * Diagnostic.
 */
export class Diagnostic {
    /** @internal */
    readonly factory: CompilerFactory;
    /** @internal */
    readonly _compilerDiagnostic: ts.Diagnostic;

    /**
     * Gets the underlying compiler diagnostic.
     */
    get compilerDiagnostic(): ts.Diagnostic {
        return this._compilerDiagnostic;
    }

    /** @internal */
    constructor(
        factory: CompilerFactory,
        diagnostic: ts.Diagnostic
    ) {
        this.factory = factory;
        this._compilerDiagnostic = diagnostic;
    }

    /**
     * Gets the source file.
     */
    getSourceFile(): SourceFile {
        return this.factory.getSourceFile(this.compilerDiagnostic.file);
    }

    /**
     * Gets the message text.
     */
    getMessageText(): string | DiagnosticMessageChain {
        const messageText = this._compilerDiagnostic.messageText;
        if (typeof messageText === "string")
            return messageText;

        return this.factory.getDiagnosticMessageChain(messageText);
    }

    /**
     * Gets the start.
     */
    getStart() {
        return this.compilerDiagnostic.start;
    }

    /**
     * Gets the length.
     */
    getLength() {
        return this.compilerDiagnostic.length;
    }

    /**
     * Gets the diagnostic category.
     */
    getCategory(): ts.DiagnosticCategory {
        return this.compilerDiagnostic.category;
    }

    /**
     * Gets the code of the diagnostic.
     */
    getCode() {
        return this.compilerDiagnostic.code;
    }

    /**
     * Gets the source.
     */
    getSource() {
        return this.compilerDiagnostic.source;
    }
}
