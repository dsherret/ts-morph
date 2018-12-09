import { expect } from "chai";
import { ExpressionedNode, ParenthesizedExpression } from "../../../../../compiler";
import { SyntaxKind } from "../../../../../typescript";
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
