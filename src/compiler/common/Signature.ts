import * as ts from "typescript";
import {GlobalContainer} from "./../../GlobalContainer";

export class Signature {
    /** @internal */
    private readonly global: GlobalContainer;
    /** @internal */
    private readonly _compilerSignature: ts.Signature;

    /**
     * Initializes a new instance of Signature.
     * @internal
     * @param global - GlobalContainer.
     * @param signature - Compiler signature.
     */
    constructor(global: GlobalContainer, signature: ts.Signature) {
        this.global = global;
        this._compilerSignature = signature;
    }

    /**
     * Gets the underlying compiler signature.
     */
    get compilerSignature() {
        return this._compilerSignature;
    }
}
