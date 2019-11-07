import { ts } from "../../../typescript";
import { Expression } from "../expression";
import { JsxAttributedNode, JsxTagNamedNode } from "./base";

const createJsxOpeningElementBase = <T extends typeof Expression>(ctor: T) => JsxAttributedNode(JsxTagNamedNode(ctor));
export const JsxOpeningElementBase = createJsxOpeningElementBase(Expression);
export class JsxOpeningElement extends JsxOpeningElementBase<ts.JsxOpeningElement> {
}
