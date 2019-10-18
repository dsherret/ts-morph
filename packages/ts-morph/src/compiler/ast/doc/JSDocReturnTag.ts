import { ts } from "@ts-morph/common";
import { JSDocTag } from "./JSDocTag";

/**
 * JS doc return tag node.
 */
export class JSDocReturnTag extends JSDocTag<ts.JSDocReturnTag> {
    /**
     * Gets the type expression node of the JS doc property return tag.
     */
    getTypeExpression() {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.typeExpression);
    }
}
