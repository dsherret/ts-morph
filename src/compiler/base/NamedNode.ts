import * as ts from "typescript";
import {Node, Identifier} from "./../common";

type ExtensionType = Node<ts.Node & { name: ts.Identifier; }>;

export interface NamedNode extends ExtensionType {
    getNameNode(): Identifier;
}

export function NamedNode<T extends Constructor<ExtensionType>>(Base: T) {
    return class extends Base implements NamedNode {
        getNameNode() {
            return this.factory.getIdentifier(this.node.name);
        }

        getName() {
            return this.getNameNode().getText();
        }

        setName(newName: string) {
            this.getNameNode().rename(newName);
            return this;
        }
    }
}
