import { ts } from "@ts-morph/common";
import { Expression } from "../expression";
import { JsxAttributedNode, JsxTagNamedNode } from "./base";

const createBase = <T extends typeof Expression>(ctor: T) => JsxAttributedNode(JsxTagNamedNode(ctor));
export const JsxOpeningElementBase = createBase(Expression);
export class JsxOpeningElement extends JsxOpeningElementBase<ts.JsxOpeningElement> {
}
