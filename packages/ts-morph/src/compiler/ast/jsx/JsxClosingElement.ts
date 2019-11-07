import { ts } from "@ts-morph/common";
import { Node } from "../common";
import { JsxTagNamedNode } from "./base";

const createBase = <T extends typeof Node>(ctor: T) => JsxTagNamedNode(ctor);
export const JsxClosingElementBase = createBase(Node);
export class JsxClosingElement extends JsxClosingElementBase<ts.JsxClosingElement> {
}
