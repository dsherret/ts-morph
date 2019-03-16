import { ExpressionedNodeStructure } from "../expressioned";
import { Structure } from "../../Structure";
import { StructureKind } from "../../StructureKind";

export interface SpreadAssignmentStructure extends SpreadAssignmentSpecificStructure, ExpressionedNodeStructure {
}

export interface SpreadAssignmentSpecificStructure extends Structure<StructureKind.SpreadAssignment> {
}