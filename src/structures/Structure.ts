import { AssertTrue, IsExact } from "conditional-type-checks";
import { StructureKind } from "./StructureKind";
import { WriterFunction } from "../main";

export interface Structure {
    /** Leading comments or whitespace. */
    leadingTrivia?: string | WriterFunction | (string | WriterFunction)[];
    /** Trailing comments or whitespace. */
    trailingTrivia?: string | WriterFunction | (string | WriterFunction)[];
}

type _assertTriviaEqual = AssertTrue<IsExact<Structure["leadingTrivia"], Structure["trailingTrivia"]>>;

export interface KindedStructure<TKind extends StructureKind> {
    kind: TKind;
}
