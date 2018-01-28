import * as ts from "typescript";
import {AssignmentExpression} from "../AssignmentExpression";
import {ObjectLiteralExpression} from "./ObjectLiteralExpression";

export const ObjectDestructuringAssignmentBase = AssignmentExpression;
export class ObjectDestructuringAssignment extends ObjectDestructuringAssignmentBase<ts.EqualsToken, ts.ObjectDestructuringAssignment> {
    /**
     * Gets the left object literal expression of the object destructuring assignment.
     */
    getLeft() {
        return this.getNodeFromCompilerNode<ObjectLiteralExpression>(this.compilerNode.left);
    }
}
