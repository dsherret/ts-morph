import * as ts from "typescript";
import {SourceFile} from "./../../compiler";
import {GlobalContainer} from "./../../GlobalContainer";
import {DiagnosticMessageChain} from "./DiagnosticMessageChain";

/**
 * Diagnostic.
 */
export class Diagnostic {
    /** @internal */
    readonly global: GlobalContainer;
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
        global: GlobalContainer,
        diagnostic: ts.Diagnostic
    ) {
        this.global = global;
        this._compilerDiagnostic = diagnostic;
    }

    /**
     * Gets the source file.
     */
    getSourceFile(): SourceFile | undefined {
        const file = this.compilerDiagnostic.file;
        return file == null ? undefined : this.global.compilerFactory.getSourceFile(file);
    }

    /**
     * Gets the message text.
     */
    getMessageText(): string | DiagnosticMessageChain {
        const messageText = this._compilerDiagnostic.messageText;
        if (typeof messageText === "string")
            return messageText;

        return this.global.compilerFactory.getDiagnosticMessageChain(messageText);
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
