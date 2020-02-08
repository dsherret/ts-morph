import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JSDocThisTag } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(JSDocThisTag), () => {
    function getInfo(text: string) {
        return getInfoFromTextWithDescendant<JSDocThisTag>(text, SyntaxKind.JSDocThisTag);
    }

    describe(nameof<JSDocThisTag>(d => d.getTypeExpression), () => {
        function doTest(text: string, expectedValue: string | undefined) {
            const { descendant } = getInfo(text);
            expect(descendant.getTypeExpression()?.getTypeNode().getText()).to.equal(expectedValue);
            if (expectedValue == null)
                expect(() => descendant.getTypeExpressionOrThrow()).to.throw();
            else
                expect(descendant.getTypeExpressionOrThrow().getTypeNode().getText()).to.equal(expectedValue);
        }

        it("should get undefined when there is no type given", () => {
            doTest("/** @this */\nfunction test() {}", undefined);
        });

        it("should get when type is given", () => {
            doTest("/** @this {boolean} - String */\nfunction test() {}", "boolean");
        });
    });
});
