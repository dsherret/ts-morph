import { ts } from "@ts-morph/common";
import { removeChildren } from "../../../manipulation";
import { JsxSpreadAttributeStructure, JsxSpreadAttributeSpecificStructure, StructureKind } from "../../../structures";
import { WriterFunction } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { Node } from "../common";

export const JsxSpreadAttributeBase = Node;
export class JsxSpreadAttribute extends JsxSpreadAttributeBase<ts.JsxSpreadAttribute> {
    /**
     * Gets the JSX spread attribute's expression.
     */
    getExpression() {
        return this._getNodeFromCompilerNode(this.compilerNode.expression);
    }

    /**
     * Sets the expression.
     * @param textOrWriterFunction - Text to set the expression with.
     */
    setExpression(textOrWriterFunction: string | WriterFunction) {
        this.getExpression().replaceWithText(textOrWriterFunction);
        return this;
    }

    /**
     * Removes the JSX spread attribute.
     */
    remove() {
        removeChildren({
            children: [this],
            removePrecedingNewLines: true,
            removePrecedingSpaces: true
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
            expression: this.getExpression().getText()
        });
    }
}
