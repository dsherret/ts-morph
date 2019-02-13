import { ts } from "../../../typescript";
import { Node } from "..";

/**
 * JS doc type expression node
 */
export class JSDocTypeExpression extends Node<ts.JSDocTypeExpression> {
    /**
     * Gets the type node of the JS Doc type expression
     */
    getTypeNode() {
        return this._getNodeFromCompilerNode(this.compilerNode.type);
    }
}
