import { KindedStructure, Structure } from "../../Structure.generated";
import { StructureKind } from "../../StructureKind";
import { ExpressionedNodeStructure } from "../expressioned";

export interface SpreadAssignmentStructure extends Structure, SpreadAssignmentSpecificStructure, ExpressionedNodeStructure {
}

export interface SpreadAssignmentSpecificStructure extends KindedStructure<StructureKind.SpreadAssignment> {
}
