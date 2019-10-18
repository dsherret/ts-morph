import { ts } from "@ts-morph/common";
import { JSDocTag } from "./JSDocTag";

/**
 * JS doc type tag node.
 */
export class JSDocTypeTag extends JSDocTag<ts.JSDocTypeTag> {
    /**
     * Gets the type expression node of the JS doc property type tag.
     */
    getTypeExpression() {
        // for some reason the compiler will still return a node when it doesn't exist
        const node = this.compilerNode.typeExpression;
        if (node != null && node.pos === node.end)
            return undefined;

        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.typeExpression);
    }
}
