import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ExpressionedNode, ParenthesizedExpression } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

describe(nameof(ExpressionedNode), () => {
    describe(nameof<ExpressionedNode>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const { descendant } = getInfoFromTextWithDescendant<ParenthesizedExpression>(text, SyntaxKind.ParenthesizedExpression);
            expect(descendant.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("(x + 1)", "x + 1");
        });
    });

    describe(nameof<ExpressionedNode>(n => n.getExpressionIfKind), () => {
        function doTest(text: string, kind: SyntaxKind, expectedText: string | undefined) {
            const { descendant } = getInfoFromTextWithDescendant<ParenthesizedExpression>(text, SyntaxKind.ParenthesizedExpression);
            const result = descendant.getExpressionIfKind(kind);
            expect(result?.getText()).to.equal(expectedText);
        }

        it("should get the expression when providing the expected value", () => {
            doTest("(x + 1)", SyntaxKind.BinaryExpression, "x + 1");
        });

        it("should not get the expression when providing something else", () => {
            doTest("(x + 1)", SyntaxKind.CallExpression, undefined);
        });
    });

    describe(nameof<ExpressionedNode>(n => n.getExpressionIfKindOrThrow), () => {
        function doTest(text: string, kind: SyntaxKind, expectedText: string | undefined) {
            const { descendant } = getInfoFromTextWithDescendant<ParenthesizedExpression>(text, SyntaxKind.ParenthesizedExpression);
            if (expectedText == null)
                expect(() => descendant.getExpressionIfKindOrThrow(kind)).to.throw();
            else
                expect(descendant.getExpressionIfKindOrThrow(kind).getText()).to.equal(expectedText);
        }

        it("should get the expression when providing the expected value", () => {
            doTest("(x + 1)", SyntaxKind.BinaryExpression, "x + 1");
        });

        it("should not get the expression when providing something else", () => {
            doTest("(x + 1)", SyntaxKind.CallExpression, undefined);
        });
    });

    describe(nameof<ExpressionedNode>(n => n.setExpression), () => {
        function doTest(text: string, newText: string, expected: string) {
            const { descendant, sourceFile } = getInfoFromTextWithDescendant<ParenthesizedExpression>(text, SyntaxKind.ParenthesizedExpression);
            descendant.setExpression(newText);
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should set", () => {
            doTest("const v = (x + 1)", "y + 2", "const v = (y + 2)");
        });
    });
});
