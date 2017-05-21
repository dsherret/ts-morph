import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";

export class Signature {
    /** @internal */
    private readonly factory: CompilerFactory;
    /** @internal */
    private readonly signature: ts.Signature;

    /**
     * Initializes a new instance of Signature.
     * @internal
     * @param factory - Compiler factory.
     * @param signature - Compiler signature.
     */
    constructor(factory: CompilerFactory, signature: ts.Signature) {
        this.factory = factory;
        this.signature = signature;
    }

    /**
     * Gets the underlying compiler signature.
     */
    getCompilerSignature() {
        return this.signature;
    }
}
