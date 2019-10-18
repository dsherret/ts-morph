import { ts } from "@ts-morph/common";
import { TypeParameteredNode } from "../base";
import { FunctionOrConstructorTypeNodeBase } from "./FunctionOrConstructorTypeNodeBase";

export const FunctionTypeNodeBase = TypeParameteredNode(FunctionOrConstructorTypeNodeBase);
export class FunctionTypeNode extends FunctionTypeNodeBase<ts.FunctionTypeNode> {
}
