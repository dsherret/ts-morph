/**
 * Options for renaming a node.
 */
export interface RenameOptions {
    /**
     * Whether comments referencing this node should be renamed.
     * @remarks False by default.
     */
    renameInComments?: boolean;
    /**
     * Whether strings referencing this node should be renamed.
     * @remarks False by default.
     */
    renameInStrings?: boolean;
}
