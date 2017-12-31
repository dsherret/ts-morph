import * as ts from "typescript";
import {expect} from "chai";
import {BooleanLiteral} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithBooleanLiteral(text: string) {
    const obj = getInfoFromText(text);
    const literal = (
        obj.sourceFile.getFirstDescendantByKind(ts.SyntaxKind.TrueKeyword) || obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.FalseKeyword)
    ) as BooleanLiteral;
    return { ...obj, literal };
}

describe(nameof(BooleanLiteral), () => {
    describe(nameof<BooleanLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: boolean) {
            const {literal} = getInfoFromTextWithBooleanLiteral(text);
            expect(literal.getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value when true", () => {
            doTest("var t = true;", true);
        });

        it("should get the correct literal value when false", () => {
            doTest("var t = false;", false);
        });
    });
});
