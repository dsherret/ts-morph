import * as ts from "typescript";
import {TsNode, TsIdentifier} from "./../common";

type ExtensionType = TsNode<ts.Node & { name: ts.Identifier; }>;

export interface TsNamedNode extends ExtensionType {
    getNameNode(): TsIdentifier;
}

export function TsNamedNode<T extends Constructor<ExtensionType>>(Base: T) {
    return class extends Base implements TsNamedNode {
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
