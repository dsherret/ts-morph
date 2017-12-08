import {expect} from "chai";
import {VariableStatement, StringLiteral, QuoteType} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithInitializer(text: string) {
    const obj = getInfoFromText<VariableStatement>(text);
    const initializer = obj.firstChild.getDeclarations()[0].getInitializerOrThrow();
    return { ...obj, initializer };
}

describe(nameof(StringLiteral), () => {
    describe(nameof<StringLiteral>(n => n.getLiteralValue), () => {
        function doTest(text: string, expectedValue: string) {
            const {initializer} = getInfoFromTextWithInitializer(text);
            expect((initializer as StringLiteral).getLiteralValue()).to.equal(expectedValue);
        }

        it("should get the correct literal value", () => {
            doTest("const t = 'str';", "str");
        });
    });

    describe(nameof<StringLiteral>(n => n.isTerminated), () => {
        function doTest(text: string, expectedValue: boolean) {
            const {initializer} = getInfoFromTextWithInitializer(text);
            expect((initializer as StringLiteral).isTerminated()).to.equal(expectedValue);
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
            const {initializer} = getInfoFromTextWithInitializer(text);
            expect((initializer as StringLiteral).hasExtendedUnicodeEscape()).to.equal(expectedValue);
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
            const {initializer} = getInfoFromTextWithInitializer(text);
            expect((initializer as StringLiteral).getQuoteType()).to.equal(quoteType);
        }

        it("should be a double when a double", () => {
            doTest(`const t = "str";`, QuoteType.Double);
        });

        it("should be a single when a single", () => {
            doTest("const t = 'str';", QuoteType.Single);
        });
    });
});
