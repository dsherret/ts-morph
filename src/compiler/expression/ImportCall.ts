import * as ts from "typescript";
import {Expression} from "./Expression";
import {ImportExpressionedNode} from "./expressioned";
import {CallExpression} from "./CallExpression";

export const ImportCallBase = ImportExpressionedNode(CallExpression);
export class ImportCall extends ImportCallBase<ts.ImportCall> {
}
