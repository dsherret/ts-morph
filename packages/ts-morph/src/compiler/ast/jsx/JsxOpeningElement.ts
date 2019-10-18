import { ts } from "@ts-morph/common";
import { Expression } from "../expression";
import { JsxAttributedNode, JsxTagNamedNode } from "./base";

export const JsxOpeningElementBase = JsxAttributedNode(JsxTagNamedNode(Expression));
export class JsxOpeningElement extends JsxOpeningElementBase<ts.JsxOpeningElement> {
}
