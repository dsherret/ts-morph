import { ExpressionedNodeStructure } from "../expressioned";
import { Structure } from "../../Structure";
import { StructureKind } from "../../StructureKind";

export interface SpreadAssignmentStructure extends Structure<StructureKind.SpreadAssignment>, ExpressionedNodeStructure {
}
