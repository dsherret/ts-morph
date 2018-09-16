import { NamedNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { CompilerNodeToWrappedType } from "../../CompilerNodeToWrappedType";
import { callBaseSet } from "../../callBaseSet";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { Node } from "../../common";
import { RenameableNode } from "./RenameableNode";

export interface NamedNodeSpecificBase<TNode extends Node> {
    /**
     * Gets the name node.
     */
    getNameNode(): TNode;
    /**
     * Gets the name.
     */
    getName(): string;
}

export type NamedNodeBaseExtensionType<TCompilerNode extends ts.Node> = Node<ts.Node & { name: TCompilerNode; }>;
export function NamedNodeBase<TCompilerNode extends ts.Node, U extends Constructor<NamedNodeBaseExtensionType<TCompilerNode>>>(Base: U):
    Constructor<NamedNodeSpecificBase<CompilerNodeToWrappedType<TCompilerNode>>> & U
{
    return class extends Base implements NamedNodeSpecificBase<CompilerNodeToWrappedType<TCompilerNode>> {
        getNameNode() {
            return this.getNodeFromCompilerNode(this.compilerNode.name);
        }

        getName() {
            return this.getNameNode().getText();
        }

        set(structure: Partial<NamedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.name != null)
                (this as any as RenameableNode).rename(structure.name);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<NamedNodeStructure>(Base.prototype, this, {
                name: this.getName()
            });
        }
    };
}
