import { expect } from "chai";
import { JSDocTypeTag, Node } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("JSDocTypeTag", () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(Node.isJSDocTypeTag), ...info };
    }

    describe(nameof.property<JSDocTypeTag>("getTypeExpression"), () => {
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
