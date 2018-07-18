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
            this.global.languageService.renameNode(getNodeToRename.call(this), newName);
            return this;

            function getNodeToRename(this: Node) {
                if (TypeGuards.isIdentifier(this))
                    return this;
                else if ((this as any).getNameNode != null)
                    return (this as any).getNameNode() as Node;
                else
                    throw new errors.NotImplementedError(`Not implemented renameable scenario for ${this.getKindName()}`);
            }
        }
    };
}
