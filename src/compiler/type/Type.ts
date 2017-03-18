import * as ts from "typescript";
import {CompilerFactory} from "./../../factories";
import {Node} from "./../common/Node";

export class Type {
    /** @internal */
    private readonly factory: CompilerFactory;
    /** @internal */
    private readonly type: ts.Type;
    /** @internal */
    private readonly enclosingNode: Node<ts.Node>;

    /**
     * Initializes a new instance of Type.
     * @internal
     * @param factory - Compiler factory.
     * @param type - Compiler type.
     * @param enclosingNode - Enclosing node.
     */
    constructor(factory: CompilerFactory, type: ts.Type, enclosingNode: Node<ts.Node>) {
        this.factory = factory;
        this.type = type;
        this.enclosingNode = enclosingNode;
    }

    /**
     * Gets the underlying compiler type.
     */
    getCompilerType() {
        return this.type;
    }

    getText(typeFormatFlags?: ts.TypeFormatFlags) {
        return this.factory.getLanguageService().getProgram().getTypeChecker().getTypeText(this, this.enclosingNode, typeFormatFlags);
    }
}
