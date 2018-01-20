import * as ts from "typescript";
import {expect} from "chai";
import {StringLiteral, QuoteType} from "./../../../compiler";
import {getInfoFromTextWithDescendant} from "./../testHelpers";

function getStringLiteral(text: string) {
    return getInfoFromTextWithDescendant<StringLiteral>(text, ts.SyntaxKind.StringLiteral).descendant;
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

    describe(nameof<StringLiteral>(n => n.getQuoteType), () => {
        function doTest(text: string, quoteType: QuoteType) {
            const literal = getStringLiteral(text);
            expect(literal.getQuoteType()).to.equal(quoteType);
        }

        it("should be a double when a double", () => {
            doTest(`const t = "str";`, QuoteType.Double);
        });

        it("should be a single when a single", () => {
            doTest("const t = 'str';", QuoteType.Single);
        });
    });
});
