import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {Node, Identifier} from "./../../common";

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
     * Sets the name.
     * @param newName - New name.
     */
    setName(newName: string): this;
}

export function NamedNode<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNode> & T {
    return class extends Base implements NamedNode {
        getNameNode() {
            return this.factory.getIdentifier(this.compilerNode.name, this.sourceFile);
        }

        getName() {
            return this.getNameNode().getText();
        }

        setName(newName: string) {
            if (newName === this.getName())
                return this;

            errors.throwIfNotStringOrWhitespace(newName, nameof(newName));
            this.getNameNode().rename(newName);
            return this;
        }
    };
}
