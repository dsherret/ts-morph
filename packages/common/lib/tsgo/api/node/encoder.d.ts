import type { Node, SourceFile } from "../../ast/index";
/**
 * The name a source file is encoded under.
 *
 * The decoder rebuilds the file with `ast.NodeFactory.NewSourceFile`, which
 * panics on a name that is not absolute and normalized, and a file whose name
 * the caller chose is under no such constraint. Only the script kind is read off
 * the name on the other side, so a bare name is rooted rather than rejected.
 */
export declare function rootedFileName(fileName: string): string;
/**
 * Encode a SourceFile AST node into the binary format.
 */
export declare function encodeSourceFile(sourceFile: SourceFile): Uint8Array;
/**
 * Encode an arbitrary AST node into the binary format.
 * When encoding a non-SourceFile node, the header hash and parse options fields will be zero.
 *
 * `nodeIndices`, when given, is filled with the index each node was written at.
 * That is how anything carried beside the tree — synthetic comments, say — names
 * the node it belongs to, since the decoder rebuilds the same indices.
 */
export declare function encodeNode(node: Node, nodeIndices?: Map<Node, number>): Uint8Array;
/**
 * Encode a Uint8Array to a base64 string.
 */
export declare function uint8ArrayToBase64(data: Uint8Array): string;
//# sourceMappingURL=encoder.d.ts.map