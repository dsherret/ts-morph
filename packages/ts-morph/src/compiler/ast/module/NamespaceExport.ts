import { ts } from "@ts-morph/common";
import { RenameableNode } from "../base";
import { Node } from "../common";

export const NamespaceExportBase = RenameableNode(Node);
export class NamespaceExport extends NamespaceExportBase<ts.NamespaceExport> {
    /**
     * Sets the name of the namespace export.
     */
    setName(name: string) {
        const nameNode = this.getNameNode();
        if (nameNode.getText() === name)
            return this;

        nameNode.replaceWithText(name);
        return this;
    }

    /**
     * Gets the name of the namespace export.
     */
    getName() {
        return this.getNameNode().getText();
    }

    /**
     * Gets the namespace export's name node.
     */
    getNameNode() {
        return this._getNodeFromCompilerNode(this.compilerNode.name);
    }
}
