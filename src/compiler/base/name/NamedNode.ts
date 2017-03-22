import * as ts from "typescript";
import * as errors from "./../../../errors";
import {Node, Identifier} from "./../../common";

// todo: make name optional, but in a different class because TypeParameterDeclaration expects a name
// (maybe NameableNode and rename some of the other "-ed" classes)
export type NamedNodeExtensionType = Node<ts.Node & { name: ts.Identifier; }>;

export interface NamedNode {
    getNameNode(): Identifier;
    getName(): string;
    setName(newName: string): this;
}

export function NamedNode<T extends Constructor<NamedNodeExtensionType>>(Base: T): Constructor<NamedNode> & T {
    return class extends Base implements NamedNode {
        getNameNode() {
            return this.factory.getIdentifier(this.node.name);
        }

        getName() {
            return this.getNameNode().getText();
        }

        setName(newName: string) {
            errors.throwIfNotStringOrWhitespace(newName, nameof(newName));
            this.getNameNode().rename(newName);
            return this;
        }
    };
}
