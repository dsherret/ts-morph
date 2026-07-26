/**
 * Synthetic comments — comments attached to a node rather than read from a file.
 *
 * A transform that builds or annotates nodes has nowhere to put a comment: the
 * printer reads comments out of the source text by position, and a node the
 * transform invented has no text behind it. Both this and the Go printer solve
 * that the same way, by carrying the comments on the node and emitting them when
 * it is printed — see `EmitContext.AddSyntheticLeadingComment` in
 * internal/printer/emitcontext.go, which the comments recorded here are replayed
 * into when the node is sent across to be printed.
 *
 * The comments live on an `emitNode` property of the node, the way TypeScript
 * stores them, so that its presence is the signal that a node is annotated even
 * though nothing about the node's own fields changed.
 */
import { SyntaxKind } from "../enums/syntaxKind.enum";
import { type Node } from "./ast";
/** A comment carried on a node instead of read from a source file. */
export interface SynthesizedComment {
    kind: SyntaxKind.SingleLineCommentTrivia | SyntaxKind.MultiLineCommentTrivia;
    text: string;
    hasTrailingNewLine?: boolean | undefined;
    hasLeadingNewline?: boolean | undefined;
}
/** What a node carries once it has been annotated. */
export interface EmitNode {
    leadingComments?: SynthesizedComment[] | undefined;
    trailingComments?: SynthesizedComment[] | undefined;
}
/** Appends a comment that prints before `node`. */
export declare function addSyntheticLeadingComment<T extends Node>(node: T, kind: SynthesizedComment["kind"], text: string, hasTrailingNewLine?: boolean): T;
/** Appends a comment that prints after `node`. */
export declare function addSyntheticTrailingComment<T extends Node>(node: T, kind: SynthesizedComment["kind"], text: string, hasTrailingNewLine?: boolean): T;
/** Replaces the comments that print before `node`. */
export declare function setSyntheticLeadingComments<T extends Node>(node: T, comments: SynthesizedComment[] | undefined): T;
/** Replaces the comments that print after `node`. */
export declare function setSyntheticTrailingComments<T extends Node>(node: T, comments: SynthesizedComment[] | undefined): T;
export declare function getSyntheticLeadingComments(node: Node): SynthesizedComment[] | undefined;
export declare function getSyntheticTrailingComments(node: Node): SynthesizedComment[] | undefined;
/** The node's annotations, or `undefined` when it has never been annotated. */
export declare function getEmitNode(node: Node): EmitNode | undefined;
