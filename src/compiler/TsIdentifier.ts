import * as ts from "typescript";
import {TsNode} from "./TsNode";

export class TsIdentifier extends TsNode<ts.Identifier> {
    getText() {
        return this.node.text;
    }

    rename(text: string) {
        const renameLocations = this.factory.getLanguageService().findRenameLocations(this);
        console.log(renameLocations);
    }

    setText(text: string) {
        // todo: typescript compiler should have ts.updateIdentifier function
        const identifierCopy = ts.createIdentifier(text);
        this.node.text = identifierCopy.text;
        this.node.flags |= ts.NodeFlags.Synthesized;
    }
}
