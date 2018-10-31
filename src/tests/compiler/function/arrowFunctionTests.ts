import { expect } from "chai";
import { ArrowFunction } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";
import { TypeGuards } from "../../../utils";

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

    describe(nameof<ArrowFunction>(n => n.addBracesToBody), () => {
        it("should add braces to arrow functions", () => {
            const { expression, sourceFile } = getInfoFromTextWithExpression(`const arrow1 = a => a + 1`);
            expression.addBracesToBody();
            const expression2 = sourceFile.getFirstDescendantOrThrow(TypeGuards.isArrowFunction);
            expect(expression2.getText()).to.equals(`a => {
    return a + 1;
}`);
        });
    });

    describe(nameof<ArrowFunction>(n => n.removeBracesFromBody), () => {
        it("should add braces to arrow functions", () => {
            const { expression, sourceFile } = getInfoFromTextWithExpression(`const arrow1 = a => { return a + 1; }`);
            expression.removeBracesFromBody();
            const expression2 = sourceFile.getFirstDescendantOrThrow(TypeGuards.isArrowFunction);
            expect(expression2.getText()).to.equals(`a => a + 1`);
        });
    });
});
