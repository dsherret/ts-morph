import { ts } from "@ts-morph/common";
import { RenameableNode } from "../base";
import { Node } from "../common";

export const NamespaceImportBase = RenameableNode(Node);
export class NamespaceImport extends NamespaceImportBase<ts.NamespaceImport> {
    /**
     * Sets the name of the namespace import.
     */
    setName(name: string) {
        const nameNode = this.getNameNode();
        if (nameNode.getText() === name)
            return this;

        nameNode.replaceWithText(name);
        return this;
    }

    /**
     * Gets the name of the namespace import.
     */
    getName() {
        return this.getNameNode().getText();
    }

    /**
     * Gets the namespace import's name node.
     */
    getNameNode() {
        return this._getNodeFromCompilerNode(this.compilerNode.name);
    }
}
