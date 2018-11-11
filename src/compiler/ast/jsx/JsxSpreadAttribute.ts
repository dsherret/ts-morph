import { removeChildren } from "../../../manipulation";
import * as errors from "../../../errors";
import { JsxSpreadAttributeStructure } from "../../../structures";
import { WriterFunction } from "../../../types";
import { ts } from "../../../typescript";
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

        if ((structure.isSpreadAttribute as boolean) === false)
            throw new errors.NotImplementedError("Not implemented ability to convert a spread attribute to a regular attribute. Open up an issue if you need this.");

        if (structure.expression != null)
            this.setExpression(structure.expression);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JsxSpreadAttributeStructure {
        return callBaseGetStructure<JsxSpreadAttributeStructure>(JsxSpreadAttributeBase.prototype, this, {
            isSpreadAttribute: true,
            expression: this.getExpression().getText()
        });
    }
}
