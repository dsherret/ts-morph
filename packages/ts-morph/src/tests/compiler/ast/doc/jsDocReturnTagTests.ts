import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JSDocReturnTag } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("JSDocReturnTag", () => {
    function getInfo(text: string) {
        return getInfoFromTextWithDescendant<JSDocReturnTag>(text, SyntaxKind.JSDocReturnTag);
    }

    describe(nameof<JSDocReturnTag>("getTypeExpression"), () => {
        function doTest(text: string, expectedValue: string | undefined) {
            const { descendant } = getInfo(text);
            expect(descendant.getTypeExpression()?.getTypeNode().getText()).to.equal(expectedValue);
            if (expectedValue == null)
                expect(() => descendant.getTypeExpressionOrThrow()).to.throw();
            else
                expect(descendant.getTypeExpressionOrThrow().getTypeNode().getText()).to.equal(expectedValue);
        }

        it("should get undefined when there is no type given", () => {
            doTest("/** @returns t - String */\nfunction test() {}", undefined);
        });

        it("should get when type is given", () => {
            doTest("/** @returns {boolean} t - String */\nfunction test() {}", "boolean");
        });
    });
});
