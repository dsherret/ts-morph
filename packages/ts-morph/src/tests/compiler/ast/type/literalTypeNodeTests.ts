import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { LiteralTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(LiteralTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<LiteralTypeNode>(text, SyntaxKind.LiteralType);
    }

    describe(nameof<LiteralTypeNode>(d => d.getLiteral), () => {
        function doTest(text: string, expected: string) {
            const { descendant } = getNode(text);
            expect(descendant.getLiteral().getText()).to.equal(expected);
        }

        it("should get the literal type for a string literal", () => {
            doTest("var t: 'some string';", "'some string'");
        });

        it("should get the literal type for a boolean literal", () => {
            doTest("var t: true;", "true");
        });

        it("should get the literal type for a number literal", () => {
            doTest("var t: 5;", "5");
        });
    });
});
