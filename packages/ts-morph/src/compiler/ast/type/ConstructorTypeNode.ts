import { ts } from "@ts-morph/common";
import { ModifierableNode } from "../base";
import { AbstractableNode } from "../class";
import { FunctionOrConstructorTypeNodeBase } from "./FunctionOrConstructorTypeNodeBase";

const createBase = <T extends typeof FunctionOrConstructorTypeNodeBase>(ctor: T) => AbstractableNode(ModifierableNode(ctor));
export const ConstructorTypeNodeBase = createBase(FunctionOrConstructorTypeNodeBase);
export class ConstructorTypeNode extends ConstructorTypeNodeBase<ts.ConstructorTypeNode> {
}
