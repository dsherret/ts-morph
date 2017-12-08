import * as ts from "typescript";
import {LiteralLikeNode} from "./../base";
import {Expression} from "./../common";
import {QuoteType} from "./QuoteType";

export const StringLiteralBase = LiteralLikeNode(Expression);
export class StringLiteral extends StringLiteralBase<ts.StringLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue() {
        // for consistency with NumericLiteral and RegularExpressionLiteral
        return this.compilerNode.text;
    }

    /**
     * Gets the quote type.
     */
    getQuoteType() {
        return this.getText()[0] === "'" ? QuoteType.Single : QuoteType.Double;
    }
}
