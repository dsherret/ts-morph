import * as ts from "typescript";
import {Node, Identifier} from "./../common";
import {syntaxKindToName} from "./../utils";

type ExtensionType = Node<ts.EnumMember>; // todo: why do I have to specify EnumMember here?

export interface PropertyNamedNode extends ExtensionType {
    getNameNode(): Identifier;
}

export function PropertyNamedNode<T extends Constructor<ExtensionType>>(Base: T) {
    return class extends Base implements PropertyNamedNode {
        getNameNode() {
            const compilerNameNode = this.node.name;

            switch (compilerNameNode.kind) {
                case ts.SyntaxKind.Identifier:
                    return this.factory.getIdentifier(compilerNameNode);
                default:
                    throw new Error(`Not implemented node kind '${syntaxKindToName(compilerNameNode.kind)}'.`);
            }
        }

        getName() {
            return this.getNameNode().getText();
        }

        setName(text: string) {
            this.getNameNode().rename(text);
            return this;
        }
    }
}
