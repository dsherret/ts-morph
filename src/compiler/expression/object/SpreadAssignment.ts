import { ts } from "../../../typescript";
import { Node } from "../../common/Node";
import { ExpressionedNode } from "../expressioned";
import { PropertyAssignment } from "./PropertyAssignment";
import { removeCommaSeparatedChild } from "../../../manipulation";

export const SpreadAssignmentBase = ExpressionedNode(Node);
export class SpreadAssignment extends SpreadAssignmentBase<ts.SpreadAssignment> {
    /**
     * Removes this property.
     */
    remove() {
        removeCommaSeparatedChild(this);
    }
}
