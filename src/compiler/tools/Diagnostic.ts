import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {SourceFile} from "./../file";
import {DiagnosticMessageChain} from "./DiagnosticMessageChain";

/**
 * Diagnostic.
 */
export class Diagnostic {
    /** @internal */
    readonly factory: CompilerFactory;
    /** @internal */
    diagnostic: ts.Diagnostic;

    constructor(
        factory: CompilerFactory,
        diagnostic: ts.Diagnostic
    ) {
        this.factory = factory;
        this.diagnostic = diagnostic;
    }

    /**
     * Gets the source file.
     */
    getSourceFile() {
        return this.factory.getSourceFile(this.diagnostic.file);
    }

    /**
     * Gets the message text.
     */
    getMessageText(): string | DiagnosticMessageChain {
        const messageText = this.diagnostic.messageText;
        if (typeof messageText === "string")
            return messageText;

        return this.factory.getDiagnosticMessageChain(messageText);
    }

    /**
     * Gets the start.
     */
    getStart() {
        return this.diagnostic.start;
    }

    /**
     * Gets the length.
     */
    getLength() {
        return this.diagnostic.length;
    }

    /**
     * Gets the diagnostic category.
     */
    getCategory(): ts.DiagnosticCategory {
        return this.diagnostic.category;
    }

    /**
     * Gets the code of the diagnostic.
     */
    getCode() {
        return this.diagnostic.code;
    }

    /**
     * Gets the source.
     */
    getSource() {
        return this.diagnostic.source;
    }

    /**
     * Gets the underlying compiler diagnostic.
     */
    getCompilerDiagnostic(): ts.Diagnostic {
        return this.diagnostic;
    }
}
