import { type Node, type SourceFile } from "./ast";
/**
 * Returns every child of `node` in source order, including tokens and
 * `SyntaxList` nodes, mirroring classic TypeScript's `Node#getChildren()`.
 */
export declare function getChildren(node: Node, sourceFile?: SourceFile): Node[];
/**
 * Returns the first child token of `node`, or `undefined` when it has none.
 *
 * Doc comments are skipped: classic looks past them for the first child that is
 * not a JSDoc node, so a documented declaration's first token is its own first
 * keyword rather than the comment's asterisk.
 */
export declare function getFirstToken(node: Node, sourceFile?: SourceFile): Node | undefined;
/** Returns the last child token of `node`, or `undefined` when it has none. */
export declare function getLastToken(node: Node, sourceFile?: SourceFile): Node | undefined;
