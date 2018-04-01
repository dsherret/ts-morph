import {ts} from "../../../typescript";
import {Constructor} from "../../../Constructor";
import * as errors from "../../../errors";
import {NamedNodeStructure} from "../../../structures";
import {Node, Identifier} from "../../common";
import {ReferencedSymbol} from "../../tools";
import {callBaseFill} from "../../callBaseFill";

// todo: make name optional, but in a different class because TypeParameterDeclaration expects a name
// (maybe NameableNode and rename some of the other "-ed" classes)
export type NamedNodeExtensionType = Node<ts.Node & { name: ts.Identifier; }>;

export interface NamedNode {
    /**
     * Gets the name node.
     */
    getNameNode(): Identifier;
    /**
     * Gets the name.
     */
    getName(): string;
    /**
     * Renames the name.
     * @param newName - New name.
     */
    rename(newName: string): this;
    /**
     * Finds the references of the node.
     */
    findReferences(): ReferencedSymbol[];
    /**
     * Gets the nodes that reference the node.
     */
    getReferencingNodes(): Node[];
}

export function NamedNode<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNode> & T {
    return class extends Base implements NamedNode {
        getNameNode() {
            return this.getNodeFromCompilerNode<Identifier>(this.compilerNode.name);
        }

        getName() {
            return this.getNameNode().getText();
        }

        rename(newName: string) {
            if (newName === this.getName())
                return this;

            errors.throwIfNotStringOrWhitespace(newName, nameof(newName));
            this.getNameNode().rename(newName);
            return this;
        }

        findReferences() {
            return this.getNameNode().findReferences();
        }

        getReferencingNodes() {
            return this.getNameNode().getDefinitionReferencingNodes();
        }

        fill(structure: Partial<NamedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.name != null)
                this.rename(structure.name);

            return this;
        }
    };
}
