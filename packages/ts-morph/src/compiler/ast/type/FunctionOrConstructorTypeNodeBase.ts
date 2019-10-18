import { ts } from "@ts-morph/common";
import { SignaturedDeclaration } from "../base";
import { TypeNode } from "./TypeNode";

export const FunctionOrConstructorTypeNodeBaseBase = SignaturedDeclaration(TypeNode);
export class FunctionOrConstructorTypeNodeBase<T extends ts.FunctionOrConstructorTypeNode = ts.FunctionOrConstructorTypeNode>
    extends FunctionOrConstructorTypeNodeBaseBase<T>
{
}
