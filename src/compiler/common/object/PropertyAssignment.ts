import * as ts from "typescript";
import {PropertyNamedNode, QuestionTokenableNode, InitializerGetExpressionableNode} from "./../../base";
import {Node} from "./../Node";

export const PropertyAssignmentBase = InitializerGetExpressionableNode(QuestionTokenableNode(PropertyNamedNode(Node)));
export class PropertyAssignment extends PropertyAssignmentBase<ts.PropertyAssignment> {
    // todo #65 - Implement manipulation for initiailizer (need to forget this node and change to PropertyAssignment)
}
