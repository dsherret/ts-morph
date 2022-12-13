import { errors, ts, SyntaxKind } from "@ts-morph/common";
import { JsxSelfClosingElementSpecificStructure, JsxSelfClosingElementStructure, StructureKind } from "../../../structures";
import { removeChildren } from "../../../manipulation";
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
      kind: StructureKind.JsxSelfClosingElement,
    });
  }

  /**
   * Removes the JSX self-closing element.
   */
  remove() {
    const parentKind = this.getParent()?.getKind()

    if (!(parentKind === SyntaxKind.JsxElement || parentKind === SyntaxKind.JsxOpeningElement)) {
      throw new errors.InvalidOperationError(`Error removing JsxSelfClosingElement: parent is ${this.getParent()?.getKindName() ?? '(no parent)'} and therefore the node cannot be removed. Only JsxSelfClosingElements with JsxElement parent can be removed`)
    }

    return removeChildren({
      children: [this],
    })
  }
}
