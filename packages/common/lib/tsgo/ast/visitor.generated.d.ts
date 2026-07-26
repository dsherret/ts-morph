import type { Node, NodeArray } from "./ast";
/**
 * A callback that receives a node and returns a visited node (or undefined to remove it).
 */
export type Visitor = (node: Node) => Node | undefined;
/**
 * Visits a Node using the supplied visitor, possibly returning a new Node in its place.
 *
 * - If the input node is undefined, then the output is undefined.
 * - If the visitor returns undefined, then the output is undefined.
 * - If the output node is not undefined, then it will satisfy the test function.
 * - In order to obtain a return type that is more specific than `Node`, a test
 *   function must be provided, and that function must be a type predicate.
 *
 * @param node The Node to visit.
 * @param visitor The callback used to visit the Node.
 * @param test A callback to execute to verify the Node is valid.
 */
export declare function visitNode<TIn extends Node | undefined, TOut extends Node>(node: TIn, visitor: Visitor, test: (node: Node) => node is TOut): TOut | (TIn & undefined);
/**
 * Visits a Node using the supplied visitor, possibly returning a new Node in its place.
 *
 * - If the input node is undefined, then the output is undefined.
 * - If the visitor returns undefined, then the output is undefined.
 *
 * @param node The Node to visit.
 * @param visitor The callback used to visit the Node.
 * @param test An optional callback to execute to verify the Node is valid.
 */
export declare function visitNode<TIn extends Node | undefined>(node: TIn, visitor: Visitor, test?: (node: Node) => boolean): Node | (TIn & undefined);
/**
 * Visits a NodeArray using the supplied visitor, possibly returning a new NodeArray in its place.
 *
 * - If the input node array is undefined, the output is undefined.
 * - If the visitor returns undefined for a node, that node is dropped from the result.
 */
export declare function visitNodes<T extends Node>(nodes: NodeArray<T>, visitor: Visitor): NodeArray<T>;
export declare function visitNodes<T extends Node>(nodes: NodeArray<T> | undefined, visitor: Visitor): NodeArray<T> | undefined;
export declare function visitNodesArray<T extends Node>(nodes: readonly T[], visitor: Visitor): readonly T[];
export declare function visitNodesArray<T extends Node>(nodes: readonly T[] | undefined, visitor: Visitor): readonly T[] | undefined;
/**
 * Visits each child of a Node using the supplied visitor, possibly returning a new Node of the same kind in its place.
 *
 * @param node The Node whose children will be visited.
 * @param visitor The callback used to visit each child.
 * @returns The original node if no children changed, or a new node with visited children.
 */
export declare function visitEachChild<T extends Node>(node: T, visitor: Visitor): T;
export declare function visitEachChild<T extends Node>(node: T | undefined, visitor: Visitor): T | undefined;
