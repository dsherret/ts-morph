import * as ts from "typescript";
import {LiteralLikeNode} from "./../base";
import {Expression} from "./../common";

export const StringLiteralBase = LiteralLikeNode(Expression);
export class StringLiteral extends StringLiteralBase<ts.StringLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue() {
        // for consistency with NumericLiteral and RegularExpressionLiteral
        return this.compilerNode.text;
    }
}
