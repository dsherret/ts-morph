import { NamedNodeStructure } from "../../base";
import { Structure, KindedStructure } from "../../Structure";
import { StructureKind } from "../../StructureKind";

export interface ShorthandPropertyAssignmentStructure extends Structure, ShorthandPropertyAssignmentSpecificStructure, NamedNodeStructure {
}

export interface ShorthandPropertyAssignmentSpecificStructure extends KindedStructure<StructureKind.ShorthandPropertyAssignment> {
}
