import * as ts from "typescript";
import {Node} from "./../../common";
import {Expression} from "./../Expression";
import {ExpressionedNode} from "./../expressioned";

export const SpreadAssignmentBase = ExpressionedNode(Node);
export class SpreadAssignment extends SpreadAssignmentBase<ts.SpreadAssignment> {
}
