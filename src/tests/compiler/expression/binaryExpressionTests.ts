import * as ts from "typescript";
import {expect} from "chai";
import {BinaryExpression} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.BinaryExpression)
    ) as BinaryExpression;
    return { ...obj, expression };
}

describe(nameof(BinaryExpression), () => {
    describe(nameof<BinaryExpression>(n => n.getLeft), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getLeft().getText()).to.equal(expectedText);
        }

        it("should get the correct left side", () => {
            doTest("var t = 1 ^ 2;", "1");
        });
    });

    describe(nameof<BinaryExpression>(n => n.getOperatorToken), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getOperatorToken().getText()).to.equal(expectedText);
        }

        it("should get the correct operator token", () => {
            doTest("var t = 1 ^ 2;", "^");
        });
    });

    describe(nameof<BinaryExpression>(n => n.getRight), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getRight().getText()).to.equal(expectedText);
        }

        it("should get the correct right side", () => {
            doTest("var t = 1 ^ 2;", "2");
        });
    });
});
