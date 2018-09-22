import { WriterFunction } from "../../../types";
import { PropertyNamedNodeStructure } from "../../base";

export interface PropertyAssignmentStructure extends PropertyAssignmentSpecificStructure, PropertyNamedNodeStructure {
}

export interface PropertyAssignmentSpecificStructure {
    initializer: string | WriterFunction;
}
