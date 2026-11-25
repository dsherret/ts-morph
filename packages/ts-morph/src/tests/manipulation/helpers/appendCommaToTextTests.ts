import { expect } from "chai";
import { appendCommaToText, isOnlyTrivia } from "../../../manipulation/helpers";

describe("appendCommaToText", () => {
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

describe("isOnlyTrivia", () => {
  it("should be true when empty or whitespace", () => {
    expect(isOnlyTrivia("")).to.be.true;
    expect(isOnlyTrivia("  \r\n\t ")).to.be.true;
  });

  it("should be true when only comments", () => {
    expect(isOnlyTrivia("// comment")).to.be.true;
    expect(isOnlyTrivia("/* block */")).to.be.true;
    expect(isOnlyTrivia("  // first\n  /* second */  ")).to.be.true;
  });

  it("should be false when containing syntax tokens", () => {
    expect(isOnlyTrivia("a")).to.be.false;
    expect(isOnlyTrivia("// comment\na: 1")).to.be.false;
    expect(isOnlyTrivia("p: 1,")).to.be.false;
  });
});
