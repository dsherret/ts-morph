import { ts } from "../../typescript";
import { SignaturedDeclaration } from "../base";
import { TypeNode } from "./TypeNode";

export const ConstructorTypeNodeBase = SignaturedDeclaration(TypeNode);
export class ConstructorTypeNode extends ConstructorTypeNodeBase<ts.ConstructorTypeNode> {
}
