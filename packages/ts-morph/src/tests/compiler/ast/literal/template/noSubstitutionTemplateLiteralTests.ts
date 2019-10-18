import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { NoSubstitutionTemplateLiteral } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

function getLiteral(text: string) {
    return getInfoFromTextWithDescendant<NoSubstitutionTemplateLiteral>(text, SyntaxKind.NoSubstitutionTemplateLiteral).descendant;
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

    describe(nameof<NoSubstitutionTemplateLiteral>(n => n.setLiteralValue), () => {
        function doTest(text: string, newValue: string, expectedText: string) {
            const literal = getLiteral(text);
            const sourceFile = literal._sourceFile;
            expect(literal.setLiteralValue(newValue).wasForgotten()).to.be.false;
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set the literal value", () => {
            doTest("const t = `str`;", "new", "const t = `new`;");
        });

        it("should set the literal value and possibly add a template expression", () => {
            doTest("const t = `str`;", "${testing}", "const t = `${testing}`;");
        });
    });
});
