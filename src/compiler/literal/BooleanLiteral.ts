import * as ts from "typescript";
import {PrimaryExpression} from "./../expression";

export const BooleanLiteralBase = PrimaryExpression;
export class BooleanLiteral extends BooleanLiteralBase<ts.BooleanLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue(): boolean {
        return this.getKind() === ts.SyntaxKind.TrueKeyword;
    }
}
