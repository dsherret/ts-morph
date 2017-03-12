import * as ts from "typescript";
import {TsNode, TsIdentifier} from "./../common";
import {syntaxKindToName} from "./../utils";

type ExtensionType = TsNode<ts.EnumMember>; // todo: why do I have to specify EnumMember here?

export interface TsPropertyNamedNode extends ExtensionType {
    getNameNode(): TsIdentifier;
}

export function TsPropertyNamedNode<T extends Constructor<ExtensionType>>(Base: T) {
    return class extends Base implements TsPropertyNamedNode {
        getNameNode() {
            const nameNode = this.node.name;

            switch (nameNode.kind) {
                case ts.SyntaxKind.Identifier:
                    return this.factory.getIdentifier(nameNode);
                default:
                    throw new Error(`Not implemented node kind '${syntaxKindToName(nameNode.kind)}'.`);
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
