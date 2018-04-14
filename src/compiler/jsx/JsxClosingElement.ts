import { ts } from "../../typescript";
import { Node } from "../common";
import { JsxTagNamedNode } from "./base";

export class JsxClosingElement extends JsxTagNamedNode(Node)<ts.JsxClosingElement> {
}
