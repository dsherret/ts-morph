import {ts} from "./../../typescript";
import {LiteralExpression} from "./../expression";
import {QuoteType} from "./QuoteType";

export const StringLiteralBase = LiteralExpression;
export class StringLiteral extends StringLiteralBase<ts.StringLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue() {
        // for consistency with other literals
        return this.compilerNode.text;
    }

    /**
     * Gets the quote type.
     */
    getQuoteType() {
        return this.getText()[0] === "'" ? QuoteType.Single : QuoteType.Double;
    }
}
