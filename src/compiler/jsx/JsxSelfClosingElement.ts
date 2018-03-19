import {ts} from "../../typescript";
import {PrimaryExpression} from "../expression";
import {JsxAttributedNode, JsxTagNamedNode} from "./base";

export class JsxSelfClosingElement extends JsxAttributedNode(JsxTagNamedNode(PrimaryExpression))<ts.JsxSelfClosingElement> {
}
