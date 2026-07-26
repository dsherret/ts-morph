import type { Node, SourceFile } from "./ast";
export declare function getTokenAtPosition(sourceFile: SourceFile, position: number): Node;
export declare function getTouchingPropertyName(sourceFile: SourceFile, position: number): Node;
export declare function getTouchingToken(sourceFile: SourceFile, position: number): Node;
/**
 * Finds the token that starts immediately after `previousToken` ends, searching
 * within `parent`.  Returns `undefined` if no such token exists.
 */
export declare function findNextToken(previousToken: Node, parent: Node, sourceFile: SourceFile): Node | undefined;
/**
 * Finds the leftmost token satisfying `position < token.end`.
 * If the position is in the trivia of that leftmost token, or the token is invalid,
 * returns the rightmost valid token with `token.end <= position`.
 * Excludes `JsxText` tokens containing only whitespace.
 */
export declare function findPrecedingToken(sourceFile: SourceFile, position: number): Node | undefined;
/** @internal */
export declare function getTokenPosOfNode(node: Node, sourceFile: SourceFile, includeJSDoc?: boolean): number;
