import * as ts from "typescript";
import {TsIdentifier} from "./TsIdentifier";
import {TsNode} from "./TsNode";

export class TsEnumDeclaration extends TsNode<ts.EnumDeclaration> {
    getNameNode() {
        return this.factory.getIdentifier(this.node.name);
    }
}
