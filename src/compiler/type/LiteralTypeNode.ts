import {ts} from "./../../typescript";
import {BooleanLiteral} from "./../literal";
import {LiteralExpression, PrefixUnaryExpression} from "./../expression";
import {TypeNode} from "./TypeNode";

export class LiteralTypeNode extends TypeNode<ts.LiteralTypeNode> {
    /**
     * Gets the literal type node's literal.
     */
    getLiteral() {
        // this statement is to be notified in case this changes
        const tsLiteral: ts.BooleanLiteral | ts.LiteralExpression | ts.PrefixUnaryExpression = this.compilerNode.literal;
        return this.getNodeFromCompilerNode<BooleanLiteral | LiteralExpression | PrefixUnaryExpression>(tsLiteral);
    }
}
