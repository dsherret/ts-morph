import * as ts from "typescript";
import * as errors from "./../../../errors";
import {Node, Identifier} from "./../../common";

type ExtensionType = Node<ts.Node & { name: ts.Identifier; }>; // todo: make name optional

export interface NamedNode extends ExtensionType {
    getNameNode(): Identifier;
    getName(): string;
    setName(newName: string): this;
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
            errors.throwIfNotStringOrWhitespace(newName, nameof(newName));
            this.getNameNode().rename(newName);
            return this;
        }
    };
}
