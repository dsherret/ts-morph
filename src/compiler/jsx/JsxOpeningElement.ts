import { ts } from "../../typescript";
import { Expression } from "../expression";
import { JsxAttributedNode, JsxTagNamedNode } from "./base";

export class JsxOpeningElement extends JsxAttributedNode(JsxTagNamedNode(Expression))<ts.JsxOpeningElement> {
}
