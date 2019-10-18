import { SyntaxKind, ts } from "@ts-morph/common";
import { PrimaryExpression } from "../expression";

export const BooleanLiteralBase = PrimaryExpression;
export class BooleanLiteral extends BooleanLiteralBase<ts.BooleanLiteral> {
    /**
     * Gets the literal value.
     */
    getLiteralValue(): boolean {
        return this.getKind() === SyntaxKind.TrueKeyword;
    }

    /**
     * Sets the literal value.
     *
     * Note: For the time being, this forgets the current node and returns the new node.
     * @param value - Value to set.
     */
    setLiteralValue(value: boolean) {
        if (this.getLiteralValue() === value)
            return this;

        // todo: make this not forget the current node
        const parent = this.getParentSyntaxList() || this.getParentOrThrow();
        const index = this.getChildIndex();
        this.replaceWithText(value ? "true" : "false");
        return parent.getChildAtIndex(index) as BooleanLiteral;
    }
}
