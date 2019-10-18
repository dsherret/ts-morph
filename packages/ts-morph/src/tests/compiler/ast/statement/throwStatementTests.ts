import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ThrowStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<ThrowStatement>(text, SyntaxKind.ThrowStatement).descendant;
}

describe(nameof(ThrowStatement), () => {
    describe(nameof<ThrowStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string | undefined) {
            const doStatement = getStatement(text);
            if (expectedText == null)
                expect(doStatement.getExpression()).to.be.undefined;
            else
                expect(doStatement.getExpression()!.getText()).to.equal(expectedText);
        }

        it("should return the correct expression", () => {
            doTest("throw new Error('foo');", "new Error('foo')");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest("function test() { throw\n}", undefined);
        });
    });

    describe(nameof<ThrowStatement>(n => n.getExpressionOrThrow), () => {
        function doTest(text: string, expectedText: string | undefined) {
            const doStatement = getStatement(text);
            if (expectedText == null)
                expect(() => doStatement.getExpressionOrThrow()).to.throw();
            else
                expect(doStatement.getExpressionOrThrow().getText()).to.equal(expectedText);
        }

        it("should return the correct expression", () => {
            doTest("throw new Error('foo');", "new Error('foo')");
        });

        it("should throw when it doesn't exist", () => {
            doTest("function test() { throw\n}", undefined);
        });
    });
});
