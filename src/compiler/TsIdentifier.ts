import * as ts from "typescript";
import {TsNode} from "./TsNode";

export class TsIdentifier extends TsNode<ts.Identifier> {
    getText() {
        return this.node.text;
    }

    rename(text: string) {
        this.factory.getLanguageService().renameNode(this, text);
    }
}
