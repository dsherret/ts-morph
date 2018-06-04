import { ts } from "../../typescript";
import { TypeElementMemberedNode } from "../base";
import { TypeNode } from "./TypeNode";

export const TypeLiteralNodeBase = TypeElementMemberedNode(TypeNode);
export class TypeLiteralNode extends TypeLiteralNodeBase<ts.TypeLiteralNode> {
}
