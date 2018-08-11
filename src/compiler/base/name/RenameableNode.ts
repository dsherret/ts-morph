import * as errors from "../../../errors";
import { Constructor } from "../../../types";
import { ts } from "../../../typescript";
import { TypeGuards } from "../../../utils";
import { Node } from "../../common";

export type RenameableNodeExtensionType = Node<ts.Node>;

export interface RenameableNode {
    /**
     * Renames the name of the node.
     * @param newName - New name.
     */
    rename(newName: string): this;
}

export function RenameableNode<T extends Constructor<RenameableNodeExtensionType>>(Base: T): Constructor<RenameableNode> & T {
    return class extends Base implements RenameableNode {
        rename(newName: string) {
            this.context.languageService.renameNode(getNodeToRename(this), newName);
            return this;

            function getNodeToRename(thisNode: Node) {
                if (TypeGuards.isIdentifier(thisNode))
                    return thisNode;
                else if ((thisNode as any).getNameNode != null)
                    return (thisNode as any).getNameNode() as Node;
                else
                    throw new errors.NotImplementedError(`Not implemented renameable scenario for ${thisNode.getKindName()}`);
            }
        }
    };
}
