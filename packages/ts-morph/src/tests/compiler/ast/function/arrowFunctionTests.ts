import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ArrowFunction } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const info = getInfoFromTextWithDescendant<ArrowFunction>(text, SyntaxKind.ArrowFunction);
    return { ...info, expression: info.descendant };
}

describe(nameof(ArrowFunction), () => {
    describe(nameof<ArrowFunction>(n => n.getEqualsGreaterThan), () => {
        function doTest(text: string, expectedText: string) {
            const { expression } = getInfoFromTextWithExpression(text);
            expect(expression.getEqualsGreaterThan().getText()).to.equal(expectedText);
        }

        it("should get the correct equals greater than token", () => {
            doTest("(x) => {}", "=>");
        });
    });
});
