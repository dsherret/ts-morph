import { expect } from "chai";
import { SyntaxKind } from "@ts-morph/common";
import { BigIntLiteral } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

declare function BigInt(value: any): any;

describe(nameof(BigIntLiteral), typeof BigInt === "undefined" ? () => {} : () => {
    function getDescendant(text: string) {
        return getInfoFromTextWithDescendant<BigIntLiteral>(text, SyntaxKind.BigIntLiteral);
    }

    describe(nameof<BigIntLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: number) {
            const { descendant } = getDescendant(text);
            expect(descendant.getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value", () => {
            doTest("100n;", BigInt(100));
        });
    });

    describe(nameof<BigIntLiteral>(n => n.setLiteralValue), () => {
        function doTest(text: string, value: any, expectedText: string) {
            const { descendant, sourceFile } = getDescendant(text);
            descendant.setLiteralValue(value);
            expect(sourceFile.getText()).to.equal(expectedText);
        }

        it("should set the literal value", () => {
            doTest("const t = 10n;", BigInt(20), "const t = 20n;");
        });

        it("should throw when providing a non-bigint value", () => {
            const { descendant } = getDescendant("100n;");
            expect(() => descendant.setLiteralValue(3)).to.throw();
        });
    });
});
