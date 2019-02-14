import { ts } from "../../../typescript";
import { JSDocTag } from "./JSDocTag";

/**
 * JS doc type tag node.
 */
export class JSDocTypeTag extends JSDocTag<ts.JSDocTypeTag> {
    /**
     * Gets the type expression node of the JS doc property type tag.
     */
    getTypeExpression() {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.typeExpression);
    }
}
