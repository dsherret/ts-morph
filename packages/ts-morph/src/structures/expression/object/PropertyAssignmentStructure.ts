import { WriterFunction } from "../../../types";
import { PropertyNamedNodeStructure } from "../../base";
import { KindedStructure, Structure } from "../../Structure";
import { StructureKind } from "../../StructureKind";

export interface PropertyAssignmentStructure extends Structure, PropertyAssignmentSpecificStructure, PropertyNamedNodeStructure {
}

export interface PropertyAssignmentSpecificStructure extends KindedStructure<StructureKind.PropertyAssignment> {
    initializer: string | WriterFunction;
}
