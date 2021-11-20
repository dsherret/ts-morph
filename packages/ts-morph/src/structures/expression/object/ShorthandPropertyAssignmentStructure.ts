import { NamedNodeStructure } from "../../base";
import { KindedStructure, Structure } from "../../Structure.generated";
import { StructureKind } from "../../StructureKind";

export interface ShorthandPropertyAssignmentStructure extends Structure, ShorthandPropertyAssignmentSpecificStructure, NamedNodeStructure {
}

export interface ShorthandPropertyAssignmentSpecificStructure extends KindedStructure<StructureKind.ShorthandPropertyAssignment> {
}
