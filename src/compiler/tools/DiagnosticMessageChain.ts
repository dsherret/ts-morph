import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";

/**
 * Diagnostic message chain.
 */
export class DiagnosticMessageChain {
    /** @internal */
    readonly factory: CompilerFactory;
    /** @internal */
    diagnosticMessageChain: ts.DiagnosticMessageChain;

    /** @internal */
    constructor(
        factory: CompilerFactory,
        diagnosticMessageChain: ts.DiagnosticMessageChain
    ) {
        this.factory = factory;
        this.diagnosticMessageChain = diagnosticMessageChain;
    }

    /**
     * Gets the message text.
     */
    getMessageText() {
        return this.diagnosticMessageChain.messageText;
    }

    /**
     * Gets th enext diagnostic message chain in the chain.
     */
    getNext(): DiagnosticMessageChain | undefined {
        const next = this.diagnosticMessageChain.next;
        if (next == null)
            return undefined;

        return this.factory.getDiagnosticMessageChain(next);
    }

    /**
     * Gets the code of the diagnostic message chain.
     */
    getCode() {
        return this.diagnosticMessageChain.code;
    }

    /**
     * Gets the category of the diagnostic message chain.
     */
    getCategory(): ts.DiagnosticCategory {
        return this.diagnosticMessageChain.category;
    }

    /**
     * Gets the underlying compiler object.
     */
    getCompilerDiagnosticMessageChain(): ts.DiagnosticMessageChain {
        return this.diagnosticMessageChain;
    }
}
