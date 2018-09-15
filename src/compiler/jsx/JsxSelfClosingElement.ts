import { ts } from "../../typescript";
import { JsxElementStructure } from "../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { PrimaryExpression } from "../expression";
import { JsxAttributedNode, JsxTagNamedNode } from "./base";

export const JsxSelfClosingElementBase = JsxAttributedNode(JsxTagNamedNode(PrimaryExpression));
export class JsxSelfClosingElement extends JsxSelfClosingElementBase<ts.JsxSelfClosingElement> {
    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JsxElementStructure {
        const structure = callBaseGetStructure<JsxElementStructure>(JsxSelfClosingElementBase.prototype, this, {
            name: this.getTagName().getText(),
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
