import { type FileReference, ModifierFlags, type Node, type SourceFile, SyntaxKind } from "../../ast/index";
import type { TimingCollector } from "../timing";
import { NODE_DATA_TYPE_CHILDREN, NODE_DATA_TYPE_EXTENDED, NODE_DATA_TYPE_STRING } from "./protocol";
export declare const popcount8: number[];
export type NodeDataType = typeof NODE_DATA_TYPE_CHILDREN | typeof NODE_DATA_TYPE_STRING | typeof NODE_DATA_TYPE_EXTENDED;
export declare const NODE_DATA_TYPE_MASK = 3221225472;
export declare const NODE_CHILD_MASK = 255;
export declare const NODE_STRING_INDEX_MASK = 16777215;
export declare const NODE_EXTENDED_DATA_MASK = 16777215;
export interface TextDecoder {
    decode(input?: ArrayBufferView | ArrayBufferLike): string;
}
export interface SourceFileInfo {
    readonly _offsetNodes: number;
    readonly _offsetStringTableOffsets: number;
    readonly _offsetStringTable: number;
    readonly _offsetExtendedData: number;
    readonly _offsetStructuredData: number;
    readonly _decoder: TextDecoder;
    nodes: any[];
    readonly path?: string;
    /**
     * The timing collector that per-node materialization is reported into, and
     * that this source file registered itself with when fetched. Present only
     * when timing collection is enabled; when undefined, materialization is not
     * timed and no clock is read.
     */
    readonly _timing?: TimingCollector | undefined;
    readFileReferences(offset: number): readonly FileReference[];
    readNodeIndexArray(offset: number): readonly Node[];
    readStringArray(offset: number): readonly string[];
    getOrCreateNodeAtIndex(index: number): Node;
}
/**
 * Read the 128-bit content hash from a source file binary response as a hex string.
 */
export declare function readSourceFileHash(data: DataView): string;
/**
 * Read the per-file parse options key from a source file binary response.
 * This encodes the ExternalModuleIndicatorOptions bitmask as a string,
 * allowing the client to distinguish files parsed with different options.
 */
export declare function readParseOptionsKey(data: DataView): string;
export declare function modifierToFlag(kind: SyntaxKind): ModifierFlags;
export declare class RemoteNodeBase {
    parent: any;
    view: DataView;
    protected index: number;
    protected _byteIndex: number;
    constructor(view: DataView, index: number, parent: any, byteIndex: number);
    get kind(): SyntaxKind;
    /**
     * Returns every child in source order, including the tokens and
     * `SyntaxList` nodes the tree does not store.
     *
     * The free function does the work; it lives in ../../ast/children.ts
     * because it is about the AST rather than about the wire format. `this` is
     * always a RemoteNode at runtime — only that subclass is constructed —
     * which is why getSourceFile is reachable here.
     */
    getChildren(sourceFile?: SourceFile): Node[];
    getChildCount(sourceFile?: SourceFile): number;
    getChildAt(index: number, sourceFile?: SourceFile): Node;
    getFirstToken(sourceFile?: SourceFile): Node | undefined;
    getLastToken(sourceFile?: SourceFile): Node | undefined;
    get pos(): number;
    get end(): number;
    get next(): number;
    protected get parentIndex(): number;
    protected get data(): number;
    protected get dataType(): NodeDataType;
    protected get childMask(): number;
    protected getFileText(start: number, end: number): string;
    protected get sourceFile(): SourceFileInfo;
}
