import { ts } from "../../../typescript";
import { JsxSelfClosingElementStructure, JsxSelfClosingElementSpecificStructure, StructureKind } from "../../../structures";
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
    set(structure: Partial<JsxSelfClosingElementStructure>) {
        callBaseSet(JsxSelfClosingElementBase.prototype, this, structure);

        if (structure.attributes != null) {
            this.getAttributes().forEach(a => a.remove());
            this.addAttributes(structure.attributes);
        }

        if (structure.name != null)
            this.getTagNameNode().replaceWithText(structure.name);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JsxSelfClosingElementStructure {
        const structure = callBaseGetStructure<JsxSelfClosingElementSpecificStructure>(JsxSelfClosingElementBase.prototype, this, {
            kind: StructureKind.JsxSelfClosingElement,
            name: this.getTagNameNode().getText(),
            attributes: this.getAttributes().map(a => a.getStructure())
        });

        return structure;
    }
}
