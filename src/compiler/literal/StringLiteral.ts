import {ts} from "../../typescript";
import {StringUtils} from "../../utils";
import {insertIntoParentTextRange} from "../../manipulation";
import {LiteralExpression} from "../expression";
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
     * Sets the literal value text.
     * @param text - Text to set.
     */
    setLiteralValue(text: string) {
        insertIntoParentTextRange({
            newText: StringUtils.escapeChar(text, this.getQuoteType()).replace(/(\r?\n)/g, "\\$1"),
            insertPos: this.getStart() + 1,
            replacing: {
                textLength: this.getWidth() - 2
            },
            parent: this.getParentSyntaxList() || this.getParentOrThrow()
        });
        return this;
    }

    /**
     * Gets the quote type.
     */
    getQuoteType() {
        return this.getText()[0] === "'" ? QuoteType.Single : QuoteType.Double;
    }
}
