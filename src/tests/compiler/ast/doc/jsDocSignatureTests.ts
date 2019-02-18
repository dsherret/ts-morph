import { expect } from "chai";
import { JSDocSignature } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(JSDocSignature), () => {
    function getInfo(text: string) {
        return getInfoFromTextWithDescendant<JSDocSignature>(text, SyntaxKind.JSDocSignature);
    }

    describe(nameof<JSDocSignature>(d => d.getTypeNode), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            if (expected == null)
                expect(descendant.getTypeNode()).to.be.undefined;
            else
                expect(descendant.getTypeNode()!.getText()).to.equal(expected);
        }

        it("should get when it exists", () => {
            doTest("/**\n * @callback cb\n * @return {string}\n */\nlet x;", "@return {string}");
        });

        it("should be undefined when not exists", () => {
            doTest("/**\n * @callback cb\n */\nlet x;", undefined);
        });
    });
});
