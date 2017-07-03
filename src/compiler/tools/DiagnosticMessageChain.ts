import * as ts from "typescript";
import {GlobalContainer} from "./../../GlobalContainer";

/**
 * Diagnostic message chain.
 */
export class DiagnosticMessageChain {
    /** @internal */
    readonly global: GlobalContainer;
    /** @internal */
    readonly _compilerDiagnosticMessageChain: ts.DiagnosticMessageChain;

    /**
     * Gets the underlying compiler object.
     */
    get compilerDiagnosticMessageChain(): ts.DiagnosticMessageChain {
        return this._compilerDiagnosticMessageChain;
    }

    /** @internal */
    constructor(
        global: GlobalContainer,
        diagnosticMessageChain: ts.DiagnosticMessageChain
    ) {
        this.global = global;
        this._compilerDiagnosticMessageChain = diagnosticMessageChain;
    }

    /**
     * Gets the message text.
     */
    getMessageText() {
        return this.compilerDiagnosticMessageChain.messageText;
    }

    /**
     * Gets th enext diagnostic message chain in the chain.
     */
    getNext(): DiagnosticMessageChain | undefined {
        const next = this.compilerDiagnosticMessageChain.next;
        if (next == null)
            return undefined;

        return this.global.compilerFactory.getDiagnosticMessageChain(next);
    }

    /**
     * Gets the code of the diagnostic message chain.
     */
    getCode() {
        return this.compilerDiagnosticMessageChain.code;
    }

    /**
     * Gets the category of the diagnostic message chain.
     */
    getCategory(): ts.DiagnosticCategory {
        return this.compilerDiagnosticMessageChain.category;
    }
}
