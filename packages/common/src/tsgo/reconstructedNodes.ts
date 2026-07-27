/**
 * Nodes that are rebuilt on the client rather than stored by the compiler.
 *
 * tsgo's AST holds only real nodes: punctuation, the keyword tokens that are not
 * nodes in their own right, and the `SyntaxList`s ts-morph exposes are rebuilt by
 * scanning the gaps between stored children. Those rebuilt nodes have no handle
 * on the Go side, so anything that asks the compiler about a node — the checker,
 * find-references — cannot be given one.
 */
import { RemoteNode } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/node/node.js";
import type { Node } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/ast.js";

/** Gets if the node was rebuilt on the client and so has no compiler handle. */
export function isReconstructedNode(node: Node): boolean {
  return !(node instanceof RemoteNode);
}

/**
 * The nearest node the compiler actually stores — the node itself, or the closest
 * ancestor that is not reconstructed.
 *
 * Positional questions (what is in scope here, what references this) still have an
 * answer for a rebuilt node, and it is the answer for the node that encloses it.
 * Returns undefined only if nothing in the chain is stored, which a node reached
 * from a parsed file cannot be.
 */
export function getStoredNode(node: Node): Node | undefined {
  let current: Node | undefined = node;
  while (current != null && isReconstructedNode(current))
    current = current.parent;
  return current;
}
