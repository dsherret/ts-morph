import {expect} from "chai";
import {TypeGuards, JSDocTypeTag} from "../../../../main";
import {getInfoFromText} from "../../testHelpers";

describe(nameof(JSDocTypeTag), () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(TypeGuards.isJSDocTypeTag), ...info };
    }

    describe(nameof<JSDocTypeTag>(d => d.getTypeExpression), () => {
        it("returns undefined when typeExpression is undefined", () => {
            const { descendant } = getInfo("/** @type */\nvar bar = 1;");
            expect(descendant.getTypeExpression()).to.be.undefined;
        });

        it("should get when type is given", () => {
            const { descendant } = getInfo("/** @type {boolean} */\nvar bar = 1");
            expect(descendant.getTypeExpression()!.getTypeNode().getText()).to.equal("boolean");
        });
    });
});
