import { errors, KeyValueCache, ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { RenameOptions, RenameLocation } from "../../../tools";
import { replaceSourceFileTextForRename } from "../../../../manipulation";
import { SourceFile } from "../../module";

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
            const languageService = this._context.languageService;
            renameNode(getNodeToRename(this));
            return this;

            function getNodeToRename(thisNode: Node) {
                if (Node.isIdentifier(thisNode))
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

            function renameNode(node: Node) {
                errors.throwIfWhitespaceOrNotString(newName, nameof(newName));

                if (node.getText() === newName)
                    return;

                const renameLocations = languageService.findRenameLocations(node, options);
                const renameLocationsBySourceFile = new KeyValueCache<SourceFile, RenameLocation[]>();

                for (const renameLocation of renameLocations) {
                    const locations = renameLocationsBySourceFile.getOrCreate<RenameLocation[]>(renameLocation.getSourceFile(), () => []);
                    locations.push(renameLocation);
                }

                for (const [sourceFile, locations] of renameLocationsBySourceFile.getEntries()) {
                    replaceSourceFileTextForRename({
                        sourceFile,
                        renameLocations: locations,
                        newName
                    });
                }
            }
        }
    };
}
