import type { Node, NodeArray } from "./ast";
/**
 * Creates a deep clone of a node and its subtree, synthesizing new nodes for every child.
 * The resulting tree has fully set parent pointers.
 *
 * @param node The node to clone.
 * @param includeTrivia Whether to preserve the text range (pos/end) on the clone.
 */
export declare function getSynthesizedDeepClone<T extends Node>(node: T, includeTrivia?: boolean): T;
export declare function getSynthesizedDeepClone<T extends Node>(node: T | undefined, includeTrivia?: boolean): T | undefined;
/**
 * Creates deep clones of a NodeArray and all its elements.
 */
export declare function getSynthesizedDeepClones<T extends Node>(nodes: NodeArray<T>, includeTrivia?: boolean): NodeArray<T>;
export declare function getSynthesizedDeepClones<T extends Node>(nodes: NodeArray<T> | undefined, includeTrivia?: boolean): NodeArray<T> | undefined;
