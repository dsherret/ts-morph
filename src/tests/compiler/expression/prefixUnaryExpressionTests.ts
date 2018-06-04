import { expect } from "chai";
import { PrefixUnaryExpression } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

describe(nameof(PrefixUnaryExpression), () => {
    const expression = "x";
    const expr = `++${expression}`;
    const {descendant: prefixUnaryExpression} = getInfoFromTextWithDescendant<PrefixUnaryExpression>(expr, SyntaxKind.PrefixUnaryExpression);

    describe(nameof<PrefixUnaryExpression>(n => n.getOperand), () => {
        it("should get the correct expression", () => {
            expect(prefixUnaryExpression.getOperand()!.getText()).to.equal(expression);
        });
    });

    describe(nameof<PrefixUnaryExpression>(n => n.getOperatorToken), () => {
        it("should return the operator token", () => {
            expect(prefixUnaryExpression.getOperatorToken()).to.equal(SyntaxKind.PlusPlusToken);
        });
    });
});
