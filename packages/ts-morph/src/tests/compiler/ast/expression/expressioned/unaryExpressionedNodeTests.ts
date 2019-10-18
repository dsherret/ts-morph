import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { AwaitExpression, UnaryExpressionedNode } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

describe(nameof(UnaryExpressionedNode), () => {
    describe(nameof<UnaryExpressionedNode>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const { descendant } = getInfoFromTextWithDescendant<AwaitExpression>(text, SyntaxKind.AwaitExpression);
            expect(descendant.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("await x;", "x");
        });
    });
});
