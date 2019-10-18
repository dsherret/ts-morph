import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { NumericLiteral } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(NumericLiteral), () => {
    describe(nameof<NumericLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: number) {
            const { descendant } = getInfoFromTextWithDescendant<NumericLiteral>(text, SyntaxKind.NumericLiteral);
            expect(descendant.getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value", () => {
            doTest("interface MyInterface { 5: string; }", 5);
        });

        it("should get the correct literal value when a decimal value", () => {
            doTest("interface MyInterface { 5.5: string; }", 5.5);
        });

        it("should get the correct literal value when in exponent notation", () => {
            doTest("const t = 1.23e-8;", 1.23e-8);
        });
    });

    describe(nameof<NumericLiteral>(n => n.setLiteralValue), () => {
        function doTest(text: string, value: number, expectedText: string) {
            const { descendant, sourceFile } = getInfoFromTextWithDescendant<NumericLiteral>(text, SyntaxKind.NumericLiteral);
            descendant.setLiteralValue(value);
            expect(sourceFile.getText()).to.equal(expectedText);
        }

        it("should set the literal value for an integer", () => {
            doTest("const t = 5;", 4, "const t = 4;");
        });

        it("should set the correct literal value to a decimal value", () => {
            doTest("const t = 5;", 4.9878, "const t = 4.9878;");
        });

        it("should set the correct literal value to a value in decimal notation", () => {
            doTest("const t = 5;", 1.23e-8, "const t = 1.23e-8;");
        });
    });
});
