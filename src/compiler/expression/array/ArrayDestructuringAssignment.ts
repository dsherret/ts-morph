import * as ts from "typescript";
import {AssignmentExpression} from "../AssignmentExpression";
import {ArrayLiteralExpression} from "./ArrayLiteralExpression";

export const ArrayDestructuringAssignmentBase = AssignmentExpression;
export class ArrayDestructuringAssignment extends ArrayDestructuringAssignmentBase<ts.EqualsToken, ts.ArrayDestructuringAssignment> {
    /**
     * Gets the left array literal expression of the array destructuring assignment.
     */
    getLeft() {
        return this.getNodeFromCompilerNode(this.compilerNode.left) as ArrayLiteralExpression;
    }
}
