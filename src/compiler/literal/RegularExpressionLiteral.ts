import {ts} from "./../../typescript";
import {LiteralExpression} from "./../expression";

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
}
