import { ts } from "@ts-morph/common";
import { JsxSelfClosingElementStructure, JsxSelfClosingElementSpecificStructure, StructureKind } from "../../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { PrimaryExpression } from "../expression";
import { JsxAttributedNode, JsxTagNamedNode } from "./base";

const createBase = <T extends typeof PrimaryExpression>(ctor: T) => JsxAttributedNode(JsxTagNamedNode(ctor));
export const JsxSelfClosingElementBase = createBase(PrimaryExpression);
export class JsxSelfClosingElement extends JsxSelfClosingElementBase<ts.JsxSelfClosingElement> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<JsxSelfClosingElementStructure>) {
        callBaseSet(JsxSelfClosingElementBase.prototype, this, structure);
        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JsxSelfClosingElementStructure {
        return callBaseGetStructure<JsxSelfClosingElementSpecificStructure>(JsxSelfClosingElementBase.prototype, this, {
            kind: StructureKind.JsxSelfClosingElement
        });
    }
}
