import { AssertTrue, IsExactType } from "conditional-type-checks";
import { StructureKind } from "./StructureKind";
import { WriterFunction } from "../main";

export interface Structure {
    /** Leading comments or whitespace. */
    leadingTrivia?: string | WriterFunction | (string | WriterFunction)[];
    /** Trailing comments or whitespace. */
    trailingTrivia?: string | WriterFunction | (string | WriterFunction)[];
}

type _assertTriviaEqual = AssertTrue<IsExactType<Structure["leadingTrivia"], Structure["trailingTrivia"]>>;

export interface KindedStructure<TKind extends StructureKind> {
    kind: TKind;
}
