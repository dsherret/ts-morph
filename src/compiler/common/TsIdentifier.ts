import * as ts from "typescript";
import {TsNode} from "./TsNode";

export class TsIdentifier extends TsNode<ts.Identifier> {
    getText() {
        return this.node.text;
    }

    /**
     * Renames an identifier.
     * @param newName - New name of the identifier.
     */
    rename(newName: string) {
        this.factory.getLanguageService().renameNode(this, newName);
    }
}
