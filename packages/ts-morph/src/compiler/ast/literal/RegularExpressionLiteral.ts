import { ts } from "@ts-morph/common";
import { replaceNodeText } from "../../../manipulation";
import { LiteralExpression } from "../expression";

export const RegularExpressionLiteralBase = LiteralExpression;
export class RegularExpressionLiteral extends RegularExpressionLiteralBase<ts.RegularExpressionLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue(): RegExp {
        const pattern = /^\/(.*)\/([^\/]*)$/;
        const text = this.compilerNode.text;
        const matches = pattern.exec(text)!;
        return new RegExp(matches[1], matches[2]);
    }

    /**
     * Sets the literal value according to a pattern and some flags.
     * @param pattern - Pattern.
     * @param flags - Flags.
     */
    setLiteralValue(pattern: string, flags?: string): this;
    /**
     * Sets the literal value according to a regular expression object.
     * @param regExp - Regular expression.
     */
    setLiteralValue(regExp: RegExp): this;
    setLiteralValue(regExpOrPattern: RegExp | string, flags?: string) {
        let pattern: string;
        if (typeof regExpOrPattern === "string")
            pattern = regExpOrPattern;
        else {
            pattern = regExpOrPattern.source;
            flags = regExpOrPattern.flags;
        }

        replaceNodeText({
            sourceFile: this._sourceFile,
            start: this.getStart(),
            replacingLength: this.getWidth(),
            newText: `/${pattern}/${flags || ""}`
        });

        return this;
    }
}
