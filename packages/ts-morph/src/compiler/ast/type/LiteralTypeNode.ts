import { ts } from "@ts-morph/common";
import { LiteralExpression, PrefixUnaryExpression } from "../expression";
import { BooleanLiteral } from "../literal";
import { TypeNode } from "./TypeNode";

export class LiteralTypeNode extends TypeNode<ts.LiteralTypeNode> {
    /**
     * Gets the literal type node's literal.
     */
    getLiteral(): BooleanLiteral | LiteralExpression | PrefixUnaryExpression {
        // this statement is to be notified in case this changes
        const tsLiteral: ts.BooleanLiteral | ts.LiteralExpression | ts.PrefixUnaryExpression = this.compilerNode.literal;
        return this._getNodeFromCompilerNode(tsLiteral);
    }
}
