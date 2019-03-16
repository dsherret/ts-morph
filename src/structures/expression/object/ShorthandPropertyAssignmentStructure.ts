import { NamedNodeStructure } from "../../base";
import { Structure } from "../../Structure";
import { StructureKind } from "../../StructureKind";

export interface ShorthandPropertyAssignmentStructure
    extends Structure<StructureKind.ShorthandPropertyAssignment>, ShorthandPropertyAssignmentSpecificStructure, NamedNodeStructure
{
}

export interface ShorthandPropertyAssignmentSpecificStructure {
}
