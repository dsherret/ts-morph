import { ts } from "../../../typescript";
import { AssignmentExpression } from "../AssignmentExpression";
import { ArrayLiteralExpression } from "./ArrayLiteralExpression";

export const ArrayDestructuringAssignmentBase = AssignmentExpression;
export class ArrayDestructuringAssignment extends ArrayDestructuringAssignmentBase<ts.ArrayDestructuringAssignment, ts.EqualsToken> {
    /**
     * Gets the left array literal expression of the array destructuring assignment.
     */
    getLeft(): ArrayLiteralExpression {
        return this.getNodeFromCompilerNode(this.compilerNode.left);
    }
}
