import { ts } from "../../../typescript";
import { SignatureDeclaration } from "../base";
import { TypeNode } from "./TypeNode";

export const FunctionOrConstructorTypeNodeBaseBase = SignatureDeclaration(TypeNode);
export class FunctionOrConstructorTypeNodeBase<T extends ts.FunctionOrConstructorTypeNode = ts.FunctionOrConstructorTypeNode>
    extends FunctionOrConstructorTypeNodeBaseBase<T>
{
}
