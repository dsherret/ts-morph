import { expect } from "chai";
import { JSDocReturnTag } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(JSDocReturnTag), () => {
    function getInfo(text: string) {
        return getInfoFromTextWithDescendant<JSDocReturnTag>(text, SyntaxKind.JSDocReturnTag);
    }

    describe(nameof<JSDocReturnTag>(d => d.getTypeExpression), () => {
        it("should get undefined when there is no type given", () => {
            const { descendant } = getInfo("/** @returns t - String */\nfunction test() {}");
            expect(descendant.getTypeExpression()).to.be.undefined;
        });

        it("should get when type is given", () => {
            const { descendant } = getInfo("/** @returns {boolean} t - String */\nfunction test() {}");
            expect(descendant.getTypeExpression()!.getTypeNode().getText()).to.equal("boolean");
        });
    });
});
