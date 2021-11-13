import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { PropertyAccessExpression, SuperExpressionedNode } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

describe("SuperExpressionedNode", () => {
    describe(nameof.property<SuperExpressionedNode>("getExpression"), () => {
        function doTest(text: string, expectedText: string) {
            const { descendant } = getInfoFromTextWithDescendant<PropertyAccessExpression>(text, SyntaxKind.PropertyAccessExpression);
            expect(descendant.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("super.x", "super");
        });
    });
});
