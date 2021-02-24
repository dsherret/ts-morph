import { ts } from "@ts-morph/common";
import { ModifierableNode } from "../base";
import { AbstractableNode } from "../class";
import { FunctionOrConstructorTypeNodeBase } from "./FunctionOrConstructorTypeNodeBase";

export const ConstructorTypeNodeBase = AbstractableNode(ModifierableNode(FunctionOrConstructorTypeNodeBase));
export class ConstructorTypeNode extends ConstructorTypeNodeBase<ts.ConstructorTypeNode> {
}
