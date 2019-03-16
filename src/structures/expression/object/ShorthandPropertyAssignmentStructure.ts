import { NamedNodeStructure } from "../../base";
import { Structure } from "../../Structure";
import { StructureKind } from "../../StructureKind";

export interface ShorthandPropertyAssignmentStructure
    extends ShorthandPropertyAssignmentSpecificStructure, NamedNodeStructure
{
}

export interface ShorthandPropertyAssignmentSpecificStructure extends Structure<StructureKind.ShorthandPropertyAssignment> {
}
