import * as ts from "typescript";
import {expect} from "chai";
import {StringLiteral, LiteralLikeNode} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithLiteral(text: string, kind: ts.SyntaxKind) {
    const obj = getInfoFromText(text);
    const literal = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(kind)
    ) as any as LiteralLikeNode;
    return {...obj, literal};
}

describe(nameof(LiteralLikeNode), () => {
    describe(nameof<LiteralLikeNode>(n => n.getLiteralText), () => {
        function doTest(text: string, kind: ts.SyntaxKind, expectedValue: string) {
            const {literal} = getInfoFromTextWithLiteral(text, kind);
            expect(literal.getLiteralText()).to.equal(expectedValue);
        }

        it("should get the correct literal value for a string", () => {
            doTest(`const t: "test";`, ts.SyntaxKind.StringLiteral, "test");
        });

        it("should get the correct literal value for a number", () => {
            doTest(`const t: 5;`, ts.SyntaxKind.NumericLiteral, "5");
        });
    });
});
