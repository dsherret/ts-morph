import { DiagnosticCategory, ts } from "@ts-morph/common";
import { IsExact, AssertTrue } from "conditional-type-checks";

/**
 * Diagnostic message chain.
 */
export class DiagnosticMessageChain {
    /** @internal */
    readonly _compilerObject: ts.DiagnosticMessageChain;

    /** @private */
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
     * Gets the next diagnostic message chains in the chain.
     */
    getNext(): DiagnosticMessageChain[] | undefined {
        // pre-TS 3.6 this was not an array
        type _assertType = AssertTrue<IsExact<ts.DiagnosticMessageChain["next"], ts.DiagnosticMessageChain[] | undefined>>;
        const next = this.compilerObject.next as ts.DiagnosticMessageChain | ts.DiagnosticMessageChain[] | undefined;
        if (next == null)
            return undefined;

        if (next instanceof Array)
            return next.map(n => new DiagnosticMessageChain(n));

        return [new DiagnosticMessageChain(next)];
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
