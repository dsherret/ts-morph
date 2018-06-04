import { DiagnosticCategory, ts } from "../../../typescript";

/**
 * Diagnostic message chain.
 */
export class DiagnosticMessageChain {
    /** @internal */
    readonly _compilerObject: ts.DiagnosticMessageChain;

    /** @internal */
    constructor(compilerObject: ts.DiagnosticMessageChain) {
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

        return new DiagnosticMessageChain(next);
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
    getCategory(): DiagnosticCategory {
        return this.compilerObject.category;
    }
}
