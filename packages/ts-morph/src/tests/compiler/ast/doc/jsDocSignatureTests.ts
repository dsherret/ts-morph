import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { JSDocSignature } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("JSDocSignature", () => {
    function getInfo(text: string) {
        return getInfoFromTextWithDescendant<JSDocSignature>(text, SyntaxKind.JSDocSignature);
    }

    describe(nameof<JSDocSignature>("getTypeNode"), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            expect(descendant.getTypeNode()?.getText()).to.equal(expected);
        }

        it("should get when it exists", () => {
            doTest("/**\n * @callback cb\n * @return {string}\n */\nlet x;", "@return {string}\n ");
        });

        it("should be undefined when not exists", () => {
            doTest("/**\n * @callback cb\n */\nlet x;", undefined);
        });
    });
});
