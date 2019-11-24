import { expect } from "chai";
import { JSDocTypeTag } from "../../../../main";
import { getInfoFromText } from "../../testHelpers";
import { Node } from "../../../../compiler";

describe(nameof(JSDocTypeTag), () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(Node.isJSDocTypeTag), ...info };
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
