import { ts } from "@ts-morph/common";
import { AssignmentExpression } from "../AssignmentExpression";
import { ArrayLiteralExpression } from "./ArrayLiteralExpression";

export const ArrayDestructuringAssignmentBase = AssignmentExpression;
export class ArrayDestructuringAssignment extends ArrayDestructuringAssignmentBase<ts.ArrayDestructuringAssignment> {
    /**
     * Gets the left array literal expression of the array destructuring assignment.
     */
    getLeft(): ArrayLiteralExpression {
        return this._getNodeFromCompilerNode(this.compilerNode.left);
    }
}
