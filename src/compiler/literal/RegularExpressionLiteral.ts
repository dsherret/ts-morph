import * as ts from "typescript";
import {LiteralLikeNode} from "./../base";
import {Expression} from "./../common";

export const RegularExpressionLiteralBase = LiteralLikeNode(Expression);
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
