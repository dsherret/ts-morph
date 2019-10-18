import { ts } from "@ts-morph/common";
import { replaceNodeText } from "../../../manipulation";
import { LiteralExpression } from "../expression";

export const NumericLiteralBase = LiteralExpression;
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

    /**
     * Sets the literal value.
     * @param value - Value to set.
     */
    setLiteralValue(value: number) {
        replaceNodeText({
            sourceFile: this._sourceFile,
            start: this.getStart(),
            replacingLength: this.getWidth(),
            newText: value.toString(10)
        });
        return this;
    }
}
