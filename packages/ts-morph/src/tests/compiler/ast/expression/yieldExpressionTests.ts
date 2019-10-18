import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { YieldExpression } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfoFromTextWithYieldExpression(text: string) {
    const info = getInfoFromTextWithDescendant<YieldExpression>(text, SyntaxKind.YieldExpression);
    return { ...info, yieldExpression: info.descendant };
}

describe(nameof(YieldExpression), () => {
    const expression = "x";
    const expr = `yield ${expression}`;
    const emptyExpr = "function*() { yield; }";
    const { yieldExpression } = getInfoFromTextWithYieldExpression(expr);
    const { yieldExpression: emptyYieldExpression } = getInfoFromTextWithYieldExpression(emptyExpr);

    describe(nameof<YieldExpression>(n => n.getExpression), () => {
        it("should get the correct expression", () => {
            expect(yieldExpression.getExpression()!.getText()).to.equal(expression);
        });

        it("should get the correct undefined expression", () => {
            expect(emptyYieldExpression.getExpression()).to.be.undefined;
        });
    });

    describe(nameof<YieldExpression>(n => n.getExpressionOrThrow), () => {
        it("should should return the expression", () => {
            expect(yieldExpression.getExpressionOrThrow().getText()).to.equal(expression);
        });

        it("should throw without an expression", () => {
            expect(() => emptyYieldExpression.getExpressionOrThrow()).to.throw();
        });
    });
});
