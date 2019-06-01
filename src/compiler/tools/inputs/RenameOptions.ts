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
    /**
     * Whether to enable renaming shorthand property assignments, binding elements, and import & export specifiers without changing behaviour.
     * @remarks Defaults to the `usePrefixAndSuffixTextForRename` manipulation setting.
     */
    usePrefixAndSuffixText?: boolean;
}
