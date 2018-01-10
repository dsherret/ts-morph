import * as ts from "typescript";
import {Expression} from "./Expression";
import {SuperExpressionedNode} from "./expressioned";
import {CallExpression} from "./CallExpression";

export const SuperCallBase = SuperExpressionedNode(CallExpression);
export class SuperCall extends SuperCallBase<ts.SuperCall> {
}
