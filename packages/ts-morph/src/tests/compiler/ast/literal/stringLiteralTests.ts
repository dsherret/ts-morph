import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { QuoteKind, StringLiteral } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStringLiteral(text: string) {
    return getInfoFromTextWithDescendant<StringLiteral>(text, SyntaxKind.StringLiteral).descendant;
}

describe(nameof(StringLiteral), () => {
    describe(nameof<StringLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: string) {
            const literal = getStringLiteral(text);
            expect(literal.getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value", () => {
            doTest("const t = 'str';", "str");
        });
    });

    describe(nameof<StringLiteral>(n => n.setLiteralValue), () => {
        function doTest(text: string, newValue: string, expectedText: string, expectedLiteralText?: string) {
            const literal = getStringLiteral(text);
            const sourceFile = literal._sourceFile;
            literal.setLiteralValue(newValue);
            expect(literal.wasForgotten()).to.be.false;
            expect(sourceFile.getFullText()).to.equal(expectedText);
            if (expectedLiteralText != null)
                expect(literal.getText()).to.equal(expectedLiteralText);
        }

        it("should set the literal value and leave the quotes as-is", () => {
            doTest("const t = 'str';", "new", "const t = 'new';", "'new'");
        });

        it("should set the literal value and escape any quote characters of the same kind", () => {
            doTest("const t = 'str';", `"test'this'out"`, `const t = '"test\\'this\\'out"';`);
        });

        it("should escape any new lines", () => {
            doTest(`const t = "str";`, `1\n'2'\r\n"3"`, `const t = "1\\\n'2'\\\r\n\\"3\\"";`);
        });
    });

    describe(nameof<StringLiteral>(n => n.isTerminated), () => {
        function doTest(text: string, expectedValue: boolean) {
            const literal = getStringLiteral(text);
            expect(literal.isTerminated()).to.equal(expectedValue);
        }

        it("should be terminated", () => {
            doTest("const t = 'str';", true);
        });

        it("should not be terminated", () => {
            doTest("const t = 'str", false);
        });
    });

    describe(nameof<StringLiteral>(n => n.hasExtendedUnicodeEscape), () => {
        function doTest(text: string, expectedValue: boolean) {
            const literal = getStringLiteral(text);
            expect(literal.hasExtendedUnicodeEscape()).to.equal(expectedValue);
        }

        it("should not have extended unicode escape", () => {
            doTest("const t = 'str';", false);
        });

        it("should have extended unicode escape", () => {
            doTest("const t = '\\u{20bb7}';", true);
        });
    });

    describe(nameof<StringLiteral>(n => n.getQuoteKind), () => {
        function doTest(text: string, quoteKind: QuoteKind) {
            const literal = getStringLiteral(text);
            expect(literal.getQuoteKind()).to.equal(quoteKind);
        }

        it("should be a double when a double", () => {
            doTest(`const t = "str";`, QuoteKind.Double);
        });

        it("should be a single when a single", () => {
            doTest("const t = 'str';", QuoteKind.Single);
        });
    });
});
