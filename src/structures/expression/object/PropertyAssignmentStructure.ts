import { WriterFunction } from "../../../types";
import { PropertyNamedNodeStructure } from "../../base";
import { Structure } from "../../Structure";
import { StructureKind } from "../../StructureKind";

export interface PropertyAssignmentStructure extends PropertyAssignmentSpecificStructure, PropertyNamedNodeStructure {
}

export interface PropertyAssignmentSpecificStructure extends Structure<StructureKind.PropertyAssignment> {
    initializer: string | WriterFunction;
}
