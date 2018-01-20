import * as ts from "typescript";
import {expect} from "chai";
import {NoSubstitutionTemplateLiteral} from "./../../../../compiler";
import {getInfoFromTextWithDescendant} from "./../../testHelpers";

function getLiteral(text: string) {
    return getInfoFromTextWithDescendant<NoSubstitutionTemplateLiteral>(text, ts.SyntaxKind.NoSubstitutionTemplateLiteral).descendant;
}

describe(nameof(NoSubstitutionTemplateLiteral), () => {
    describe(nameof<NoSubstitutionTemplateLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: string) {
            const literal = getLiteral(text);
            expect(literal.getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value", () => {
            doTest("const t: `test`;", "test");
        });
    });
});
