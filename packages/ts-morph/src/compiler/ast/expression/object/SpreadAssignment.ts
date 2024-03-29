import { ts } from "@ts-morph/common";
import { ExpressionedNodeStructure, SpreadAssignmentSpecificStructure, SpreadAssignmentStructure, StructureKind } from "../../../../structures";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { callBaseSet } from "../../callBaseSet";
import { ExpressionedNode } from "../expressioned";
import { ObjectLiteralElement } from "./ObjectLiteralElement";

export const SpreadAssignmentBase = ExpressionedNode(ObjectLiteralElement);
export class SpreadAssignment extends SpreadAssignmentBase<ts.SpreadAssignment> {
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
      expression: this.getExpression().getText(), // todo: should this be moved down to the base? if not, explain in a comment here
    }) as any as SpreadAssignmentStructure;
  }
}
