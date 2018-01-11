import * as ts from "typescript";
import {LiteralExpression} from "./../../expression";

export const NoSubstitutionTemplateLiteralBase = LiteralExpression;
export class NoSubstitutionTemplateLiteral extends NoSubstitutionTemplateLiteralBase<ts.NoSubstitutionTemplateLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue() {
        // for consistency with other literals
        return this.compilerNode.text;
    }
}
