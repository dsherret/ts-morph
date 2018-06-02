import { ts } from "../../typescript";
import { Node } from "../common";
import { JsxTagNamedNode } from "./base";

export const JsxClosingElementBase = JsxTagNamedNode(Node);
export class JsxClosingElement extends JsxClosingElementBase<ts.JsxClosingElement> {
}
