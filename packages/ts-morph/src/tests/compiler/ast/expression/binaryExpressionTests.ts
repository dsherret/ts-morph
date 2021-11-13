import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { BinaryExpression } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getBinaryExpression(text: string) {
    return getInfoFromTextWithDescendant<BinaryExpression>(text, SyntaxKind.BinaryExpression).descendant;
}

describe("BinaryExpression", () => {
    describe(nameof.property<BinaryExpression>("getLeft"), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getBinaryExpression(text);
            expect(expression.getLeft().getText()).to.equal(expectedText);
        }

        it("should get the correct left side", () => {
            doTest("var t = 1 ^ 2;", "1");
        });
    });

    describe(nameof.property<BinaryExpression>("getOperatorToken"), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getBinaryExpression(text);
            expect(expression.getOperatorToken().getText()).to.equal(expectedText);
        }

        it("should get the correct operator token", () => {
            doTest("var t = 1 ^ 2;", "^");
        });
    });

    describe(nameof.property<BinaryExpression>("getRight"), () => {
        function doTest(text: string, expectedText: string) {
            const expression = getBinaryExpression(text);
            expect(expression.getRight().getText()).to.equal(expectedText);
        }

        it("should get the correct right side", () => {
            doTest("var t = 1 ^ 2;", "2");
        });
    });
});
