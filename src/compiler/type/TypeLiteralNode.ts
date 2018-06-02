import { ts } from "../../typescript";
import { TypeElementMemberedNode } from "../base";
import { TypeNode } from "./TypeNode";
import { TypeElementTypes } from "../aliases";

export const TypeLiteralNodeBase = TypeElementMemberedNode(TypeNode);
export class TypeLiteralNode extends TypeLiteralNodeBase<ts.TypeLiteralNode> {
}
