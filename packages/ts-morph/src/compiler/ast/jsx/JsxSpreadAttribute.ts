import { ts } from "@ts-morph/common";
import { removeChildren } from "../../../manipulation";
import { JsxSpreadAttributeSpecificStructure, JsxSpreadAttributeStructure, StructureKind } from "../../../structures";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { ExpressionedNode } from "../expression";

export const JsxSpreadAttributeBase = ExpressionedNode(Node);
export class JsxSpreadAttribute extends JsxSpreadAttributeBase<ts.JsxSpreadAttribute> {
    /**
     * Removes the JSX spread attribute.
     */
    remove() {
        removeChildren({
            children: [this],
            removePrecedingNewLines: true,
            removePrecedingSpaces: true,
        });
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<JsxSpreadAttributeStructure>) {
        callBaseSet(JsxSpreadAttributeBase.prototype, this, structure);

        if (structure.expression != null)
            this.setExpression(structure.expression);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JsxSpreadAttributeStructure {
        return callBaseGetStructure<JsxSpreadAttributeSpecificStructure>(JsxSpreadAttributeBase.prototype, this, {
            kind: StructureKind.JsxSpreadAttribute,
            expression: this.getExpression().getText(),
        });
    }
}
