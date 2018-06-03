import { ts } from "../../../typescript";
import { AssignmentExpression } from "../AssignmentExpression";
import { ObjectLiteralExpression } from "./ObjectLiteralExpression";

export const ObjectDestructuringAssignmentBase = AssignmentExpression;
export class ObjectDestructuringAssignment extends ObjectDestructuringAssignmentBase<ts.ObjectDestructuringAssignment, ts.EqualsToken> {
    /**
     * Gets the left object literal expression of the object destructuring assignment.
     */
    getLeft(): ObjectLiteralExpression {
        return this.getNodeFromCompilerNode(this.compilerNode.left);
    }
}
