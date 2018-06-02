import { ts } from "../../typescript";
import { SignaturedDeclaration, TypeParameteredNode } from "../base";
import { TypeNode } from "./TypeNode";

export const FunctionTypeNodeBase = TypeParameteredNode(SignaturedDeclaration(TypeNode));
export class FunctionTypeNode extends FunctionTypeNodeBase<ts.FunctionTypeNode> {
}
