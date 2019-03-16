import { WriterFunction } from "../../../types";
import { PropertyNamedNodeStructure } from "../../base";
import { Structure } from "../../Structure";
import { StructureKind } from "../../StructureKind";

export interface PropertyAssignmentStructure extends Structure<StructureKind.PropertyAssignment>, PropertyAssignmentSpecificStructure, PropertyNamedNodeStructure {
}

export interface PropertyAssignmentSpecificStructure {
    initializer: string | WriterFunction;
}
