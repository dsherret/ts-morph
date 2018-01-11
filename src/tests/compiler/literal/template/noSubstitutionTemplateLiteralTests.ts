import * as ts from "typescript";
import {expect} from "chai";
import {NoSubstitutionTemplateLiteral} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithLiteral(text: string) {
    const obj = getInfoFromText(text);
    const literal = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.NoSubstitutionTemplateLiteral)
    ) as NoSubstitutionTemplateLiteral;
    return {...obj, literal};
}

describe(nameof(NoSubstitutionTemplateLiteral), () => {
    describe(nameof<NoSubstitutionTemplateLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: string) {
            const {literal} = getInfoFromTextWithLiteral(text);
            expect(literal.getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value", () => {
            doTest("const t: `test`;", "test");
        });
    });
});
