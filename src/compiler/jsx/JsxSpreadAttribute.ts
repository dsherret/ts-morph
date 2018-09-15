import { removeChildren } from "../../manipulation";
import { JsxSpreadAttributeStructure } from "../../structures";
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
