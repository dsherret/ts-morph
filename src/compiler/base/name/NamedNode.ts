import { NamedNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { callBaseFill } from "../../callBaseFill";
import { Identifier, Node } from "../../common";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { RenameableNode } from "./RenameableNode";

// todo: make name optional, but in a different class because TypeParameterDeclaration expects a name
// (maybe NameableNode and rename some of the other "-ed" classes)
export type NamedNodeExtensionType = Node<ts.Node & { name: ts.Identifier; }>;

export interface NamedNode extends NamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export interface NamedNodeSpecific {
    /**
     * Gets the name node.
     */
    getNameNode(): Identifier;
    /**
     * Gets the name.
     */
    getName(): string;
}

export function NamedNode<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNode> & T {
    return NamedNodeInternal(RenameableNode(ReferenceFindableNode(Base)));
}

export function NamedNodeInternal<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNodeSpecific> & T {
    return class extends Base implements NamedNodeSpecific {
        getNameNode() {
            return this.getNodeFromCompilerNode(this.compilerNode.name);
        }

        getName() {
            return this.getNameNode().getText();
        }

        fill(structure: Partial<NamedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

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
