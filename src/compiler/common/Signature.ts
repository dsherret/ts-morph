import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";

export class Signature {
    /** @internal */
    private readonly factory: CompilerFactory;
    /** @internal */
    private readonly _compilerSignature: ts.Signature;

    /**
     * Initializes a new instance of Signature.
     * @internal
     * @param factory - Compiler factory.
     * @param signature - Compiler signature.
     */
    constructor(factory: CompilerFactory, signature: ts.Signature) {
        this.factory = factory;
        this._compilerSignature = signature;
    }

    /**
     * Gets the underlying compiler signature.
     */
    get compilerSignature() {
        return this._compilerSignature;
    }
}
