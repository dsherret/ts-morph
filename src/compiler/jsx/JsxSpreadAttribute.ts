import { removeChildren } from "../../manipulation";
import { JsxSpreadAttributeStructure } from "../../structures";
import { WriterFunction } from "../../types";
import { ts } from "../../typescript";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { Node } from "../common";

export const JsxSpreadAttributeBase = Node;
export class JsxSpreadAttribute extends JsxSpreadAttributeBase<ts.JsxSpreadAttribute> {
    /**
     * Gets the JSX spread attribute's expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNode(this.compilerNode.expression);
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
     * Gets the structure equivalent to this node.
     */
    getStructure(): JsxSpreadAttributeStructure {
        return callBaseGetStructure<JsxSpreadAttributeStructure>(JsxSpreadAttributeBase.prototype, this, {
            isSpreadAttribute: true,
            expression: this.getExpression().getText()
        });
    }
}
