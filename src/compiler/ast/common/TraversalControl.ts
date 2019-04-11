import { Node } from "../../../compiler";
import { ts } from "../../../typescript";

export interface ForEachChildTraversalControl {
    /**
     * Stops traversal.
     * @param node - Optional node to return.
     */
    stop(node?: Node): void;
}

export interface ForEachDescendantTraversalControl extends ForEachChildTraversalControl {
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
