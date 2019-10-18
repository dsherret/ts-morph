import { ts } from "@ts-morph/common";
import { TypeNode } from "../type";

/**
 * JS doc type expression node.
 */
export class JSDocTypeExpression extends TypeNode<ts.JSDocTypeExpression> {
    /**
     * Gets the type node of the JS doc type expression.
     */
    getTypeNode() {
        return this._getNodeFromCompilerNode(this.compilerNode.type);
    }
}
