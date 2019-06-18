import { expect } from "chai";
import { appendCommaToText } from "../../../manipulation/helpers";

describe(nameof(appendCommaToText), () => {
    function runTest(inputText: string, expectedText: string) {
        const result = appendCommaToText(inputText);
        expect(result).to.equal(expectedText);
    }

    it("should append when it does not end with a comma", () => {
        runTest("testing", "testing,");
    });

    it("should append when there is another comma separated value", () => {
        runTest("testing, testing", "testing, testing,");
    });

    it("should append when there is another comma separated value", () => {
        runTest("testing, testing", "testing, testing,");
    });

    it("should append when ending with a comment", () => {
        runTest("testing // comment", "testing, // comment");
    });

    it("should append when the comment has a comma", () => {
        runTest("testing // comment, other", "testing, // comment, other");
    });

    it("should append when a comment block is in the way", () => {
        runTest("a /* c */", "a, /* c */");
    });

    it("should append when the comment is on the previous line", () => {
        runTest("// a, b\nc", "// a, b\nc,");
    });

    it("should not append when it ends with a comma", () => {
        runTest("testing,", "testing,");
    });

    it("should not append when it ends with a comma and a comment line", () => {
        runTest("testing, // test", "testing, // test");
    });

    it("should append when empty", () => {
        runTest("", "");
    });

    it("should append when only a comment", () => {
        runTest(" // a", " // a");
    });
});
