import {expect} from "chai";
import {JSDocReturnTag, TypeGuards} from '../../../../main';
import {getInfoFromText} from '../../testHelpers';

describe(nameof(JSDocReturnTag), () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(TypeGuards.isJSDocReturnTag), ...info };
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