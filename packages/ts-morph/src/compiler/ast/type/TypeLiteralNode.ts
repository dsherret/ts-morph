import { ts } from "@ts-morph/common";
import { TypeElementMemberedNode } from "../base";
import { TypeNode } from "./TypeNode";

export const TypeLiteralNodeBase = TypeElementMemberedNode(TypeNode);
export class TypeLiteralNode extends TypeLiteralNodeBase<ts.TypeLiteralNode> {
}
