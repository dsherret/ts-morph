import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { BooleanLiteral } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

function getInfoFromTextWithBooleanLiteral(text: string) {
    const obj = getInfoFromText(text);
    const literal = (obj.sourceFile.getFirstDescendantByKind(SyntaxKind.TrueKeyword)
        || obj.sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.FalseKeyword)) as BooleanLiteral;
    return { ...obj, literal };
}

describe(nameof(BooleanLiteral), () => {
    describe(nameof<BooleanLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: boolean) {
            const { literal } = getInfoFromTextWithBooleanLiteral(text);
            expect(literal.getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value when true", () => {
            doTest("var t = true;", true);
        });

        it("should get the correct literal value when false", () => {
            doTest("var t = false;", false);
        });
    });

    describe(nameof<BooleanLiteral>(n => n.setLiteralValue), () => {
        function doTest(text: string, value: boolean, expectedText: string) {
            const { literal, sourceFile } = getInfoFromTextWithBooleanLiteral(text);
            literal.setLiteralValue(value);
            expect(sourceFile.getText()).to.equal(expectedText);
        }

        it("should set the boolean from false to true", () => {
            doTest("const t = false;", true, "const t = true;");
        });

        it("should set the boolean from true to false", () => {
            doTest("const t = true;", false, "const t = false;");
        });

        it("should work ok if setting to the same value", () => {
            doTest("const t = true;", true, "const t = true;");
        });
    });
});
