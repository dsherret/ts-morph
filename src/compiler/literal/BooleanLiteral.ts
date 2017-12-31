import * as ts from "typescript";
import {Expression} from "./../common";

export const BooleanLiteralBase = Expression;
export class BooleanLiteral extends BooleanLiteralBase<ts.BooleanLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue(): boolean {
        return this.getKind() === ts.SyntaxKind.TrueKeyword;
    }
}
