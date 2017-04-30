import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {Node} from "./../common/Node";
import {TypeChecker} from "./../tools";

export class Type {
    /** @internal */
    private readonly factory: CompilerFactory;
    /** @internal */
    private readonly type: ts.Type;

    /**
     * Initializes a new instance of Type.
     * @internal
     * @param factory - Compiler factory.
     * @param type - Compiler type.
     */
    constructor(factory: CompilerFactory, type: ts.Type) {
        this.factory = factory;
        this.type = type;
    }

    /**
     * Gets the underlying compiler type.
     */
    getCompilerType() {
        return this.type;
    }

    /**
     * Gets the type text.
     * @param enclosingNode - The enclosing node.
     * @param typeFormatFlags - Format flags for the type text.
     */
    getText(enclosingNode?: Node<ts.Node>, typeFormatFlags?: ts.TypeFormatFlags, typeChecker: TypeChecker = this.factory.getTypeChecker()) {
        return typeChecker.getTypeText(this, enclosingNode, typeFormatFlags);
    }
}
