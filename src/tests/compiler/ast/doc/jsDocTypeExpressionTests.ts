import {JSDocTypeExpression} from "../../../../compiler";
import {getInfoFromText} from "../../testHelpers";
import {TypeGuards} from "../../../../utils";
import {expect} from "chai";

describe(nameof(JSDocTypeExpression), () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(TypeGuards.isJSDocTypeExpression), ...info };
    }

    describe(nameof<JSDocTypeExpression>(d => d.getTypeNode), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getInfo(text);
            expect(descendant.getTypeNode().getText()).to.equal(expected);
        }

        it("should get when type is given", () => {
            doTest("/** @param {boolean} t - String */\nfunction test() {}", "boolean");
        });
    });
});
