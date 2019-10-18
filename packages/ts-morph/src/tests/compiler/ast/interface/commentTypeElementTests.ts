import { expect } from "chai";
import { CommentTypeElement, InterfaceDeclaration } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(CommentTypeElement), () => {
    describe(nameof<CommentTypeElement>(e => e.remove), () => {
        it("should remove the comment", () => {
            const { firstChild } = getInfoFromText<InterfaceDeclaration>("interface I {\n    // test\n}");
            firstChild.getMembersWithComments()[0].remove();
            expect(firstChild.getText()).to.equal("interface I {\n}");
        });
    });
});
