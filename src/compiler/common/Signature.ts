import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {Node} from "./../common";

export class Signature {
    /** @internal */
    private readonly factory: CompilerFactory;
    /** @internal */
    private readonly signature: ts.Signature;
    /** @internal */
    private readonly enclosingNode: Node<ts.SignatureDeclaration>;

    /**
     * Initializes a new instance of Signature.
     * @internal
     * @param factory - Compiler factory.
     * @param signature - Compiler signature.
     * @param enclosingNode - Enclosing node.
     */
    constructor(factory: CompilerFactory, signature: ts.Signature, enclosingNode: Node<ts.SignatureDeclaration>) {
        this.factory = factory;
        this.signature = signature;
        this.enclosingNode = enclosingNode;
    }

    /**
     * Gets the underlying compiler signature.
     */
    getCompilerSignature() {
        return this.signature;
    }

    /**
     * Gets the enclosing node.
     */
    getEnclosingNode() {
        return this.enclosingNode;
    }
}
