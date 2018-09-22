import { ts } from "../../typescript";
import * as errors from "../../errors";
import { JsxElementStructure } from "../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { PrimaryExpression } from "../expression";
import { JsxAttributedNode, JsxTagNamedNode } from "./base";

export const JsxSelfClosingElementBase = JsxAttributedNode(JsxTagNamedNode(PrimaryExpression));
export class JsxSelfClosingElement extends JsxSelfClosingElementBase<ts.JsxSelfClosingElement> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<JsxElementStructure>) {
        callBaseSet(JsxSelfClosingElementBase.prototype, this, structure);

        if (structure.attributes != null) {
            this.getAttributes().forEach(a => a.remove());
            this.addAttributes(structure.attributes);
        }

        if (structure.isSelfClosing === false)
            throw new errors.NotImplementedError("Changing a JsxSelfClosingElement to be non-self closing is not implemented. Please open an issue if you need this.");

        if (structure.children != null)
            throw new errors.NotImplementedError("Changing a JsxSelfClosingElement to be non-self closing is not implemented. Please open an issue if you need this.");

        if (structure.bodyText != null)
            throw new errors.NotImplementedError("Changing a JsxSelfClosingElement to be non-self closing is not implemented. Please open an issue if you need this.");

        if (structure.name != null)
            this.getTagNameNode().replaceWithText(structure.name);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JsxElementStructure {
        const structure = callBaseGetStructure<JsxElementStructure>(JsxSelfClosingElementBase.prototype, this, {
            name: this.getTagNameNode().getText(),
            attributes: this.getAttributes().map(a => a.getStructure()),
            children: undefined,
            isSelfClosing: true,
            bodyText: undefined
        });
        delete structure.children;
        delete structure.bodyText;
        return structure;
    }
}
