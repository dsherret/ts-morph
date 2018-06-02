import { ts } from "../../typescript";
import { PrimaryExpression } from "../expression";
import { JsxAttributedNode, JsxTagNamedNode } from "./base";

export const JsxSelfClosingElementBase = JsxAttributedNode(JsxTagNamedNode(PrimaryExpression));
export class JsxSelfClosingElement extends JsxSelfClosingElementBase<ts.JsxSelfClosingElement> {
}
