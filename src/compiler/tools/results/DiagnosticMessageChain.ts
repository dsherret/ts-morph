import * as ts from "typescript";
import {GlobalContainer} from "./../../../GlobalContainer";

/**
 * Diagnostic message chain.
 */
export class DiagnosticMessageChain {
    /** @internal */
    readonly global: GlobalContainer;
    /** @internal */
    readonly _compilerObject: ts.DiagnosticMessageChain;

    /** @internal */
    constructor(
        global: GlobalContainer,
        compilerObject: ts.DiagnosticMessageChain
    ) {
        this.global = global;
        this._compilerObject = compilerObject;
    }

    /**
     * Gets the underlying compiler object.
     */
    get compilerObject(): ts.DiagnosticMessageChain {
        return this._compilerObject;
    }

    /**
     * Gets the message text.
     */
    getMessageText() {
        return this.compilerObject.messageText;
    }

    /**
     * Gets th enext diagnostic message chain in the chain.
     */
    getNext(): DiagnosticMessageChain | undefined {
        const next = this.compilerObject.next;
        if (next == null)
            return undefined;

        return this.global.compilerFactory.getDiagnosticMessageChain(next);
    }

    /**
     * Gets the code of the diagnostic message chain.
     */
    getCode() {
        return this.compilerObject.code;
    }

    /**
     * Gets the category of the diagnostic message chain.
     */
    getCategory(): ts.DiagnosticCategory {
        return this.compilerObject.category;
    }
}
