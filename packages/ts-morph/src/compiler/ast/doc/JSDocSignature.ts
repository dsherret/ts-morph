import { ts } from "@ts-morph/common";
import { JSDocType } from "./JSDocType";

/**
 * JS doc signature node.
 */
export class JSDocSignature extends JSDocType<ts.JSDocSignature> {
    /**
     * Gets the type node of the JS doc signature.
     */
    getTypeNode() {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.type);
    }

    // todo: more methods
}
