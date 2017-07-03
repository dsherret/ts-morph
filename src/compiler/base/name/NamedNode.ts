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
    getNameIdentifier(): Identifier;
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
    return class extends Base implements NamedNode {
        getNameIdentifier() {
            return this.global.compilerFactory.getIdentifier(this.compilerNode.name, this.sourceFile);
        }

        getName() {
            return this.getNameIdentifier().getText();
        }

        rename(newName: string) {
            if (newName === this.getName())
                return this;

            errors.throwIfNotStringOrWhitespace(newName, nameof(newName));
            this.getNameIdentifier().rename(newName);
            return this;
        }
    };
}
