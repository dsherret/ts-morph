import { StructureKind } from "./StructureKind";
import { WriterFunction } from "../main";

export interface Structure {
    /** Leading comments or whitespace. */
    leadingTrivia?: string | string[] | WriterFunction;
    /** Trailing comments or whitespace. */
    trailingTrivia?: string | string[] | WriterFunction;
}

export interface KindedStructure<TKind extends StructureKind> {
    kind: TKind;
}
