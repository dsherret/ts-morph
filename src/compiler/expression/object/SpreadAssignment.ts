import { ts } from "../../../typescript";
import { Node } from "../../common/Node";
import { ExpressionedNode } from "../expressioned";
import { PropertyAssignment } from "./PropertyAssignment";
import { removeCommaSeparatedChild } from "../../../manipulation";
import { SpreadAssignmentStructure } from '../../../structures';
import { callBaseGetStructure } from '../../callBaseGetStructure';

export const SpreadAssignmentBase = ExpressionedNode(Node);
export class SpreadAssignment extends SpreadAssignmentBase<ts.SpreadAssignment> {
    /**
     * Removes this property.
     */
    remove() {
        removeCommaSeparatedChild(this);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): SpreadAssignmentStructure {
        return callBaseGetStructure<SpreadAssignmentStructure>(SpreadAssignmentBase.prototype, this, {
            expression: this.getExpression().getText()
        }) as any as SpreadAssignmentStructure;
    }
}
