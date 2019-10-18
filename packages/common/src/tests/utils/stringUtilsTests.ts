import { expect } from "chai";
import { errors } from "../../errors";
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
            expect(StringUtils.escapeForWithinString(input, "\"")).to.equal(expected);
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

    describe(nameof(StringUtils.removeIndentation), () => {
        function doTest(input: string, expectedOutput: string, options: { indentSizeInSpaces?: number; isInStringAtPos?: (pos: number) => boolean; } = {}) {
            const actualResult = StringUtils.removeIndentation(input, {
                indentSizeInSpaces: options.indentSizeInSpaces || 4,
                isInStringAtPos: options.isInStringAtPos || (() => false)
            });

            expect(actualResult).to.equal(expectedOutput);
        }

        it("should not do anything for a string on one line with no indentation", () => {
            doTest("testing", "testing");
        });

        it("should remove indentation on a single line", () => {
            doTest("    \t    testing", "testing");
        });

        it("should do nothing when one of the lines has no indentation, but others do", () => {
            const text = "testing\n    this\nout\n\tmore";
            doTest(text, text);
        });

        it("should remove hanging indentation", () => {
            doTest("testing\n    this", "testing\nthis");
        });

        it("should consider the first line's indent, but only if indented", () => {
            doTest("    testing\n        this", "testing\n    this");
        });

        it("should consider the first line's indent if only indented by one space and the tab size is 4", () => {
            doTest(" testing\n        this", "testing\n    this", { indentSizeInSpaces: 4 });
        });

        it("should consider the first line's indent if only indented by one space and the tab size is 2", () => {
            doTest(" testing\n    this", "testing\n  this", { indentSizeInSpaces: 2 });
        });

        it("should remove based on the minimum width", () => {
            doTest("{\n        test\n    }", "{\n    test\n}");
        });

        it("should remove tabs", () => {
            doTest("{\n\t\ttest\n\t}", "{\n\ttest\n}");
        });

        it("should treat tabs based on the tab size provided when mixing spaces and tabs", () => {
            doTest("{\n  \t  test\n    }", "{\n  test\n}", { indentSizeInSpaces: 2 });
        });

        it("should not deindent within strings", () => {
            let str = "this is a `";
            const pos = str.length;
            str += "\n    test`";
            const end = str.length;
            str += "\n    other";
            doTest(str, "this is a `\n    test`\nother", { isInStringAtPos: index => index >= pos && index < end });
        });
    });

    describe(nameof(StringUtils.indent), () => {
        interface TestOptions {
            indentText?: string;
            indentSizeInSpaces?: number;
            isInStringAtPos?: (pos: number) => boolean;
        }

        function doTest(input: string, times: number, expectedOutput: string, options: TestOptions = {}) {
            const actualResult = StringUtils.indent(input, times, {
                indentSizeInSpaces: options.indentSizeInSpaces || 4,
                indentText: options.indentText || "    ",
                isInStringAtPos: options.isInStringAtPos || (() => false)
            });

            expect(actualResult).to.equal(expectedOutput);
        }

        it("should do nothing when providing 0", () => {
            const text = "t\nu\n  v";
            doTest(text, 0, text);
        });

        it("should indent the provided number of times", () => {
            doTest("testing\nthis\n    out", 2, "        testing\n        this\n            out");
        });

        it("should indent based on the provided", () => {
            doTest("testing\nthis\n  out", 2, "    testing\n    this\n      out", { indentText: "  ", indentSizeInSpaces: 2 });
        });

        it("should indent with tabs", () => {
            doTest("testing\nthis\n  out", 1, "\ttesting\n\tthis\n\t  out", { indentText: "\t", indentSizeInSpaces: 4 });
        });

        it("should not indent the last line if it's empty", () => {
            doTest("testing\n", 1, "    testing\n");
        });

        it("should not indent within strings", () => {
            let text = "t`";
            const pos = text.length;
            text += "\nt`";
            const end = text.length;
            text += "\nt";

            doTest(text, 1, "    t`\nt`\n    t", {
                isInStringAtPos: p => p >= pos && p < end
            });
        });

        it("should deindent when providing a negative number", () => {
            doTest("t\n    u\nv", -1, "t\nu\nv");
        });

        it("should deindent by the provided amount", () => {
            doTest("    t\n  u\n  v", -1, "  t\nu\nv", { indentText: "  ", indentSizeInSpaces: 2 });
        });

        it("should deindent handling tabs and spaces", () => {
            doTest("\t    \tt\n\tu\n        v", -2, "\tt\nu\nv");
        });

        it("should not deindent within strings", () => {
            let text = "t`";
            const pos = text.length;
            text += "\n    t`";
            const end = text.length;
            text += "\n    t";

            doTest(text, -1, "t`\n    t`\nt", {
                isInStringAtPos: p => p >= pos && p < end
            });
        });
    });
});
