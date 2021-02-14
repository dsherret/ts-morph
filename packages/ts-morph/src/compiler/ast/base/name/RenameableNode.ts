import { errors, ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { RenameOptions } from "../../../tools";
import { Node } from "../../common";
import { renameNode } from "../helpers";

export type RenameableNodeExtensionType = Node<ts.Node>;

export interface RenameableNode {
    /**
     * Renames the name of the node.
     * @param newName - New name.
     * @param options - Options for renaming.
     */
    rename(newName: string, options?: RenameOptions): this;
}

export function RenameableNode<T extends Constructor<RenameableNodeExtensionType>>(Base: T): Constructor<RenameableNode> & T {
    return class extends Base implements RenameableNode {
        rename(newName: string, options?: RenameOptions) {
            renameNode(
                getNodeToRename(this),
                newName,
                options,
            );
            return this;

            function getNodeToRename(thisNode: Node) {
                if (Node.isIdentifier(thisNode) || Node.isPrivateIdentifier(thisNode) || Node.isStringLiteral(thisNode))
                    return thisNode;
                else if ((thisNode as any).getNameNode != null) {
                    const node = (thisNode as any).getNameNode() as Node;
                    errors.throwIfNullOrUndefined(node, "Expected to find a name node when renaming.");
                    if (Node.isArrayBindingPattern(node) || Node.isObjectBindingPattern(node))
                        throw new errors.NotImplementedError(`Not implemented renameable scenario for ${node.getKindName()}.`);
                    return node;
                }
                else {
                    throw new errors.NotImplementedError(`Not implemented renameable scenario for ${thisNode.getKindName()}`);
                }
            }
        }
    };
}
