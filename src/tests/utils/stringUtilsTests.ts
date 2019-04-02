import { expect } from "chai";
import { QuoteKind } from "../../compiler";
import * as errors from "../../errors";
import { StringUtils } from "../../utils";

describe(nameof(StringUtils), () => {
    describe(nameof(StringUtils.getLineNumberAtPos), () => {
        it("should throw if providing a negative pos", () => {
            expect(() => StringUtils.getLineNumberAtPos("", -1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        it("should not throw if providing a pos the length of the string", () => {
            expect(() => StringUtils.getLineNumberAtPos("", 0)).to.not.throw();
        });

        it("should throw if providing a pos greater than the length + 1", () => {
            expect(() => StringUtils.getLineNumberAtPos("", 1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        function doTest(newLineType: string) {
            let str = `testing${newLineType}this${newLineType}out`;
            const pos = str.length;
            str += `${newLineType}more and more${newLineType}and more`;
            expect(StringUtils.getLineNumberAtPos(str, pos)).to.equal(3);
        }

        it("should get the line position for the specified pos when using \r newlines", () => {
            doTest("\r");
        });

        it("should get the line position for the specified pos when using \n newlines", () => {
            doTest("\n");
        });

        it("should get the line position for the specified pos when using \r\n newlines", () => {
            doTest("\r\n");
        });

        it("should get the line position for the specified pos when right after the newline when mixing newlines", () => {
            let str = "testing\r\nthis\nout\rmore\r\nandmore\n";
            const pos = str.length;
            str += "out\r\nmore and more";
            expect(StringUtils.getLineNumberAtPos(str, pos)).to.equal(6);
        });
    });

    describe(nameof(StringUtils.getLengthFromLineStartAtPos), () => {
        it("should throw if providing a negative pos", () => {
            expect(() => StringUtils.getLengthFromLineStartAtPos("", -1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        it("should not throw if providing a pos the length of the string", () => {
            expect(() => StringUtils.getLengthFromLineStartAtPos("", 0)).to.not.throw();
        });

        it("should throw if providing a pos greater than the length + 1", () => {
            expect(() => StringUtils.getLengthFromLineStartAtPos("", 1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        function doTest(text: string, pos: number, expected: number) {
            expect(StringUtils.getLengthFromLineStartAtPos(text, pos)).to.equal(expected);
        }

        function doNewlineTest(newLineKind: string) {
            let text = "testing" + newLineKind;
            const startLinePos = text.length;
            text += "more text";
            const pos = text.length;
            text += newLineKind + "more text";
            doTest(text, pos, pos - startLinePos);
        }

        it("should get for the specified pos when using \r newlines", () => {
            doNewlineTest("\r");
        });

        it("should get for the specified pos when using \n newlines", () => {
            doNewlineTest("\n");
        });

        it("should get for the specified pos when using \r\n newlines", () => {
            doNewlineTest("\r\n");
        });

        it("should get on the first line", () => {
            doTest("testing this out", 10, 10);
        });
    });

    describe(nameof(StringUtils.getLineStartFromPos), () => {
        it("should throw if providing a negative pos", () => {
            expect(() => StringUtils.getLineStartFromPos("", -1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        it("should not throw if providing a pos the length of the string", () => {
            expect(() => StringUtils.getLineStartFromPos("", 0)).to.not.throw();
        });

        it("should throw if providing a pos greater than the length + 1", () => {
            expect(() => StringUtils.getLineStartFromPos("", 1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        function doTest(text: string, pos: number, expected: number) {
            expect(StringUtils.getLineStartFromPos(text, pos)).to.equal(expected);
        }

        function doNewlineTest(newLineKind: string) {
            let text = "testing" + newLineKind;
            const startLinePos = text.length;
            text += "more text";
            const pos = text.length;
            text += newLineKind + "more text";
            doTest(text, pos, startLinePos);
        }

        it("should get for the specified pos when using \\r newlines", () => {
            doNewlineTest("\r");
        });

        it("should get for the specified pos when using \\n newlines", () => {
            doNewlineTest("\n");
        });

        it("should get for the specified pos when using \\r\\n newlines", () => {
            doNewlineTest("\r\n");
        });

        it("should get on the first line", () => {
            doTest("testing this out", 10, 0);
        });
    });

    describe(nameof(StringUtils.getLineEndFromPos), () => {
        it("should throw if providing a negative pos", () => {
            expect(() => StringUtils.getLineEndFromPos("", -1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        it("should not throw if providing a pos the length of the string", () => {
            expect(() => StringUtils.getLineEndFromPos("", 0)).to.not.throw();
        });

        it("should throw if providing a pos greater than the length + 1", () => {
            expect(() => StringUtils.getLineEndFromPos("", 1)).to.throw(errors.ArgumentOutOfRangeError);
        });

        function doTest(text: string, pos: number, expected: number) {
            expect(StringUtils.getLineEndFromPos(text, pos)).to.equal(expected);
        }

        function doNewlineTest(newLineKind: string) {
            let text = "testing" + newLineKind;
            const pos = text.length;
            text += "more text";
            const endLinePos = text.length;
            text += newLineKind + "more text";
            doTest(text, pos, endLinePos);
        }

        it("should get for the specified pos when using \\r newlines", () => {
            doNewlineTest("\r");
        });

        it("should get for the specified pos when using \\n newlines", () => {
            doNewlineTest("\n");
        });

        it("should get for the specified pos when using \\r\\n newlines", () => {
            doNewlineTest("\r\n");
        });

        it("should get on the first line", () => {
            doTest("testing this out", 0, 16);
        });
    });

    describe(nameof(StringUtils.isWhitespace), () => {
        function doTest(text: string, expected: boolean) {
            expect(StringUtils.isWhitespace(text)).to.equal(expected);
        }

        it("should be whitespace when containing only whitespace characters", () => {
            doTest("  \t  \t\t\n\r\n \t", true);
        });

        it("should not be whitespace when containing a single non-whitespace character", () => {
            doTest("  \t  \t\t\n\r\na \t", false);
        });
    });

    describe(nameof(StringUtils.startsWithNewLine), () => {
        function doTest(input: string, expected: boolean) {
            expect(StringUtils.startsWithNewLine(input)).to.equal(expected);
        }

        it("should when \\r\\n", () => {
            doTest("\r\ntest", true);
        });

        it("should when \\n", () => {
            doTest("\ntest", true);
        });

        it("should not when doesn't start with newline", () => {
            doTest("t\ntest\n", false);
        });
    });

    describe(nameof(StringUtils.endsWithNewLine), () => {
        function doTest(input: string, expected: boolean) {
            expect(StringUtils.endsWithNewLine(input)).to.equal(expected);
        }

        it("should when \\r\\n", () => {
            doTest("test\r\n", true);
        });

        it("should when \\n", () => {
            doTest("test\n", true);
        });

        it("should not when doesn't end with newline", () => {
            doTest("\ntte\nst", false);
        });
    });

    describe(nameof(StringUtils.insertAtLastNonWhitespace), () => {
        function doTest(input: string, insertText: string, expected: string) {
            expect(StringUtils.insertAtLastNonWhitespace(input, insertText)).to.equal(expected);
        }

        it("should insert into a string that's all whitespace", () => {
            doTest(" \t\r\n \t", ",", ", \t\r\n \t");
        });

        it("should insert at the first non-whitespace char", () => {
            doTest(" s \t", ",", " s, \t");
        });

        it("should insert at the first non-whitespace char when that's the first char", () => {
            doTest("s \t\r\n", ",", "s, \t\r\n");
        });

        it("should insert into an empty string", () => {
            doTest("", ",", ",");
        });
    });

    describe(nameof(StringUtils.escapeForWithinString), () => {
        function doTest(input: string, expected: string) {
            expect(StringUtils.escapeForWithinString(input, QuoteKind.Double)).to.equal(expected);
        }

        it("should escape the quotes and newline", () => {
            doTest(`"testing\n this out"`, `\\"testing\\\n this out\\"`);
        });
    });

    describe(nameof(StringUtils.escapeChar), () => {
        function doTest(input: string, char: string, expected: string) {
            expect(StringUtils.escapeChar(input, char)).to.equal(expected);
        }

        it("should throw when specifying a char length > 1", () => {
            expect(() => StringUtils.escapeChar("", "ab")).to.throw();
        });

        it("should throw when specifying a char length < 1", () => {
            expect(() => StringUtils.escapeChar("", "")).to.throw();
        });

        it("should escape the single quotes when specified", () => {
            doTest(`'testing "this" out'`, `'`, `\\'testing "this" out\\'`);
        });

        it("should escape regardless of if the character is already escaped", () => {
            doTest(`"testing \\"this\\" out"`, `"`, `\\"testing \\\\"this\\\\" out\\"`);
        });
    });
});
