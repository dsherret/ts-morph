import { ts } from "../../../typescript";
import { Node } from "../../common";
import { ExpressionedNode } from "../expressioned";

export const SpreadAssignmentBase = ExpressionedNode(Node);
export class SpreadAssignment extends SpreadAssignmentBase<ts.SpreadAssignment> {
}
