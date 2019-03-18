import { ts } from "../../../../typescript";
import { Node } from "../../common/Node";
import { ExpressionedNode } from "../expressioned";
import { removeCommaSeparatedChild } from "../../../../manipulation";
import { SpreadAssignmentStructure, SpreadAssignmentSpecificStructure, StructureKind, ExpressionedNodeStructure } from "../../../../structures";
import { callBaseSet } from "../../callBaseSet";
import { callBaseGetStructure } from "../../callBaseGetStructure";

export const SpreadAssignmentBase = ExpressionedNode(Node);
export class SpreadAssignment extends SpreadAssignmentBase<ts.SpreadAssignment> {
    /**
     * Removes this property.
     */
    remove() {
        removeCommaSeparatedChild(this);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<SpreadAssignmentStructure>) {
        callBaseSet(SpreadAssignmentBase.prototype, this, structure);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): SpreadAssignmentStructure {
        return callBaseGetStructure<SpreadAssignmentSpecificStructure & ExpressionedNodeStructure>(SpreadAssignmentBase.prototype, this, {
            kind: StructureKind.SpreadAssignment,
            expression: this.getExpression().getText() // todo: should this be moved down to the base? if not, explain in a comment here
        }) as any as SpreadAssignmentStructure;
    }
}
