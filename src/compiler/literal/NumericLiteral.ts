import * as ts from "typescript";
import {LiteralLikeNode} from "./../base";
import {Expression} from "./../common";

export const NumericLiteralBase = LiteralLikeNode(Expression);
export class NumericLiteral extends NumericLiteralBase<ts.NumericLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue(): number {
        const text = this.compilerNode.text;
        if (text.indexOf(".") >= 0)
            return parseFloat(text);
        return parseInt(text, 10);
    }
}
