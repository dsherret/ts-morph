import { NamedNodeStructure } from "../../../../structures";
import { Constructor } from "../../../../types";
import { ts } from "../../../../typescript";
import { TypeGuards } from "../../../../utils";
import * as errors from "../../../../errors";
import { CompilerNodeToWrappedType } from "../../CompilerNodeToWrappedType";
import { callBaseSet } from "../../callBaseSet";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { Node } from "../../common";

export interface NamedNodeSpecificBase<TNode extends Node> {
    /**
     * Gets the name node.
     */
    getNameNode(): TNode;
    /**
     * Gets the name as a string.
     * @throws If the name node is an array binding pattern, object binding pattern, or computed property.
     */
    getName(): string;
}

export type NamedNodeBaseExtensionType<TCompilerNode extends ts.Node> = Node<ts.Node & { name: TCompilerNode; }>;
export function NamedNodeBase<TCompilerNode extends ts.Node, U extends Constructor<NamedNodeBaseExtensionType<TCompilerNode>>>(Base: U):
    Constructor<NamedNodeSpecificBase<CompilerNodeToWrappedType<TCompilerNode>>> & U
{
    return class extends Base implements NamedNodeSpecificBase<CompilerNodeToWrappedType<TCompilerNode>> {
        getNameNode() {
            return this._getNodeFromCompilerNode(this.compilerNode.name);
        }

        getName() {
            const nameNode = this.getNameNode();

            if (TypeGuards.isIdentifier(nameNode) || TypeGuards.isStringLiteral(nameNode) || TypeGuards.isNoSubstitutionTemplateLiteral(nameNode)
                || TypeGuards.isNumericLiteral(nameNode))
            {
                return nameNode.getText();
            }

            const kindName = nameNode.getKindName();
            throw new errors.InvalidOperationError(`Cannot get the name as a string for name nodes of kind ${kindName}. `
                + `Use \`.${nameof(this.getNameNode)}()\` instead and handle when it's an ${kindName}.`);
        }

        set(structure: Partial<NamedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            // do not rename here
            if (structure.name != null)
                this.getNameNode().replaceWithText(structure.name);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<NamedNodeStructure>(Base.prototype, this, {
                name: this.getName()
            });
        }
    };
}
