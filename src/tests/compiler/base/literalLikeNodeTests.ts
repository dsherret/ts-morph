import * as ts from "typescript";
import {expect} from "chai";
import {StringLiteral, LiteralLikeNode, Node} from "./../../../compiler";
import {getInfoFromTextWithDescendant} from "./../testHelpers";

describe(nameof(LiteralLikeNode), () => {
    describe(nameof<LiteralLikeNode>(n => n.getLiteralText), () => {
        function doTest(text: string, kind: ts.SyntaxKind, expectedValue: string) {
            const {descendant} = getInfoFromTextWithDescendant<LiteralLikeNode & Node>(text, kind);
            expect(descendant.getLiteralText()).to.equal(expectedValue);
        }

        it("should get the correct literal value for a string", () => {
            doTest(`const t: "test";`, ts.SyntaxKind.StringLiteral, "test");
        });

        it("should get the correct literal value for a number", () => {
            doTest(`const t: 5;`, ts.SyntaxKind.NumericLiteral, "5");
        });
    });
});
