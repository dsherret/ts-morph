import { ts } from "@ts-morph/common";

export interface ForEachDescendantTraversalControl {
    /**
     * Stops traversal.
     */
    stop(): void;
    /**
     * Skips traversal of the current node's descendants.
     */
    skip(): void;
    /**
     * Skips traversal of the current node, siblings, and all their descendants.
     */
    up(): void;
}

export interface TransformTraversalControl {
    /**
     * The node currently being transformed.
     * @remarks Use the result of `.visitChildren()` instead before transforming if visiting the children.
     */
    currentNode: ts.Node;
    /**
     * Visits the children of the current node and returns a new node for the current node.
     */
    visitChildren(): ts.Node;
}
