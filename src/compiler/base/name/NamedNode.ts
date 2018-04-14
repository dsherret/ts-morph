import { ts } from "../../../typescript";
import { Constructor } from "../../../Constructor";
import * as errors from "../../../errors";
import { NamedNodeStructure } from "../../../structures";
import { Node, Identifier } from "../../common";
import { ReferencedSymbol } from "../../tools";
import { callBaseFill } from "../../callBaseFill";
import { ReferenceFindableNode } from "./ReferenceFindableNode";

// todo: make name optional, but in a different class because TypeParameterDeclaration expects a name
// (maybe NameableNode and rename some of the other "-ed" classes)
export type NamedNodeExtensionType = Node<ts.Node & { name: ts.Identifier; }>;

export interface NamedNode extends NamedNodeSpecific, ReferenceFindableNode {
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
    /**
     * Renames the name.
     * @param newName - New name.
     */
    rename(newName: string): this;
}

export function NamedNode<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNode> & T {
    return NamedNodeInternal(ReferenceFindableNode(Base));
}

export function NamedNodeInternal<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNodeSpecific> & T {
    return class extends Base implements NamedNodeSpecific {
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

        fill(structure: Partial<NamedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.name != null)
                this.rename(structure.name);

            return this;
        }
    };
}
