import { ts } from "@ts-morph/common";
import { ModifierableNode } from "../base";
import { AbstractableNode } from "../class";
import { FunctionOrConstructorTypeNodeBase } from "./FunctionOrConstructorTypeNodeBase";

const ConstructorTypeNodeBase = AbstractableNode(ModifierableNode(FunctionOrConstructorTypeNodeBase));
export class ConstructorTypeNode extends ConstructorTypeNodeBase<ts.ConstructorTypeNode> {
}
