import {GetAccessorDeclarationStructure, SetAccessorDeclarationStructure, MethodDeclarationStructure} from "./../../class";
import {PropertyAssignmentStructure} from "./PropertyAssignmentStructure";
import {ShorthandPropertyAssignmentStructure} from "./ShorthandPropertyAssignmentStructure";
import {SpreadAssignmentStructure} from "./SpreadAssignmentStructure";

// todo: sync with ObjectLiteralElementLike in aliases
export type ObjectLiteralElementLikeStructures = PropertyAssignmentStructure | ShorthandPropertyAssignmentStructure | SpreadAssignmentStructure |
    MethodDeclarationStructure | GetAccessorDeclarationStructure | SetAccessorDeclarationStructure;

export interface ObjectLiteralExpressionStructure {
    properties: ObjectLiteralElementLikeStructures[];
}
