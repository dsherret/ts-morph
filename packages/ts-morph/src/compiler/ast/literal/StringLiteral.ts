import { StringUtils, ts } from "@ts-morph/common";
import { replaceNodeText } from "../../../manipulation";
import { LiteralExpression } from "../expression";
import { QuoteKind } from "./QuoteKind";

export const StringLiteralBase = LiteralExpression;
export class StringLiteral extends StringLiteralBase<ts.StringLiteral> {
    /**
     * Gets the literal value.
     *
     * This is equivalent to .getLiteralText() for string literals and only exists for consistency with other literals.
     */
    getLiteralValue() {
        return this.compilerNode.text;
    }

    /**
     * Sets the literal value.
     * @param value - Value to set.
     */
    setLiteralValue(value: string) {
        replaceNodeText({
            sourceFile: this._sourceFile,
            start: this.getStart() + 1,
            replacingLength: this.getWidth() - 2,
            newText: StringUtils.escapeForWithinString(value, this.getQuoteKind())
        });
        return this;
    }

    /**
     * Gets the quote kind.
     */
    getQuoteKind() {
        return this.getText()[0] === "'" ? QuoteKind.Single : QuoteKind.Double;
    }
}
