import * as ts from "typescript";
import {TsNode} from "./../common/TsNode";

type ExtensionType = TsNode<ts.Node & { name: ts.Identifier; }>;

export function TsNamedNode<T extends Constructor<ExtensionType>>(Base: T) {
    return class extends Base {
        getNameNode() {
            return this.factory.getIdentifier(this.node.name);
        }
    }
}
