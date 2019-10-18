import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { LiteralLikeNode, Node } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(LiteralLikeNode), () => {
    describe(nameof<LiteralLikeNode>(n => n.getLiteralText), () => {
        function doTest(text: string, kind: SyntaxKind, expectedValue: string) {
            const { descendant } = getInfoFromTextWithDescendant<LiteralLikeNode & Node>(text, kind);
            expect(descendant.getLiteralText()).to.equal(expectedValue);
        }

        it("should get the correct literal value for a string", () => {
            doTest(`const t: "test";`, SyntaxKind.StringLiteral, "test");
        });

        it("should get the correct literal value for a number", () => {
            doTest(`const t: 5;`, SyntaxKind.NumericLiteral, "5");
        });
    });
});
