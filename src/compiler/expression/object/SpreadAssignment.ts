import { ts } from "../../../typescript";
import { Node } from "../../common";
import { ExpressionedNode } from "../expressioned";
import { PropertyAssignment } from './PropertyAssignment';

export const SpreadAssignmentBase = ExpressionedNode(Node);
export class SpreadAssignment extends SpreadAssignmentBase<ts.SpreadAssignment> {
    /**
     * Removes this property
     */
    remove = PropertyAssignment.prototype.remove
}
