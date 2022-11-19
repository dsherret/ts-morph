import { expect } from "chai";
import { errors } from "../errors";
import { StandardizedFilePath } from "../fileSystem";
import { ts } from "../typescript";
import { nameof } from "../utils";

describe(nameof(errors, "throwIfNotType"), () => {
  it("should throw when not the same type", () => {
    expect(() => errors.throwIfNotType(4, "string", "argName")).to.throw(
      errors.ArgumentTypeError,
      "Argument Error (argName): Expected type 'string', but was 'number'.",
    );
  });

  it("should not throw when the same type", () => {
    expect(() => errors.throwIfNotType("", "string", "argName")).to.not.throw();
  });
});

describe(nameof(errors, "throwIfWhitespaceOrNotString"), () => {
  it("should throw when not a string", () => {
    expect(() => errors.throwIfWhitespaceOrNotString(4 as any, "argName")).to.throw(
      errors.ArgumentTypeError,
      "Argument Error (argName): Expected type 'string', but was 'number'.",
    );
  });

  it("should throw when null", () => {
    expect(() => errors.throwIfWhitespaceOrNotString(null as any, "argName")).to.throw(
      errors.ArgumentTypeError,
      "Argument Error (argName): Expected type 'string', but was 'object'.",
    );
  });

  it("should throw when whitespace string", () => {
    expect(() => errors.throwIfWhitespaceOrNotString(" ", "argName")).to.throw(
      errors.ArgumentNullOrWhitespaceError,
      "Argument Error (argName): Cannot be null or whitespace.",
    );
  });

  it("should throw when string that's not a whitespace string", () => {
    expect(() => errors.throwIfWhitespaceOrNotString("str", "argName")).to.not.throw();
  });
});

describe(nameof(errors, "throwIfOutOfRange"), () => {
  it("should not throw when inside the bounds", () => {
    expect(() => errors.throwIfOutOfRange(5, [1, 10], "arg")).to.not.throw();
  });

  it("should throw when outside the inclusive lower bound", () => {
    expect(() => errors.throwIfOutOfRange(0, [1, 10], "arg")).to.throw();
  });

  it("should not throw when inside the inclusive lower bound", () => {
    expect(() => errors.throwIfOutOfRange(1, [1, 10], "arg")).to.not.throw();
  });

  it("should throw when outside the inclusive upper bound", () => {
    expect(() => errors.throwIfOutOfRange(11, [1, 10], "arg")).to.throw();
  });

  it("should not throw when inside the inclusive upper bound", () => {
    expect(() => errors.throwIfOutOfRange(10, [1, 10], "arg")).to.not.throw();
  });
});

describe(nameof(errors, "throwIfRangeOutOfRange"), () => {
  it("should throw when the range is flipped", () => {
    expect(() => errors.throwIfRangeOutOfRange([9, 2], [1, 10], "arg")).to.throw();
  });

  it("should not throw when inside the bounds", () => {
    expect(() => errors.throwIfRangeOutOfRange([2, 9], [1, 10], "arg")).to.not.throw();
  });

  it("should throw when outside the inclusive lower bound", () => {
    expect(() => errors.throwIfRangeOutOfRange([0, 9], [1, 10], "arg")).to.throw();
  });

  it("should not throw when inside the inclusive lower or upper bound", () => {
    expect(() => errors.throwIfRangeOutOfRange([1, 10], [1, 10], "arg")).to.not.throw();
  });

  it("should throw when outside the inclusive upper bound", () => {
    expect(() => errors.throwIfRangeOutOfRange([2, 11], [1, 10], "arg")).to.throw();
  });
});

describe(nameof(errors, "throwIfNegative"), () => {
  it("should throw when negative", () => {
    expect(() => errors.throwIfNegative(-1, "arg")).to.throw();
  });

  it("should not throw when positive", () => {
    expect(() => errors.throwIfNegative(1, "arg")).to.not.throw();
  });

  it("should not throw when 0", () => {
    expect(() => errors.throwIfNegative(0, "arg")).to.not.throw();
  });
});

describe(nameof(errors, "throwNotImplementedForSyntaxKindError"), () => {
  let result: Error;
  try {
    errors.throwNotImplementedForSyntaxKindError(ts.SyntaxKind.EnumDeclaration);
  } catch (ex: any) {
    result = ex;
  }

  it("should return a NotImplementedError", () => {
    expect(result).to.be.instanceOf(errors.NotImplementedError);
  });

  it("should have the correct message", () => {
    expect(result.message).to.equal("Not implemented feature for syntax kind 'EnumDeclaration'.");
  });
});

describe(nameof(errors, "throwIfNotEqual"), () => {
  it("should throw when not equal", () => {
    expect(() => errors.throwIfNotEqual(1, 2, "New length should equal old length.")).to.throw(
      errors.InvalidOperationError,
      "Expected 1 to equal 2. New length should equal old length.",
    );
  });

  it("should not throw when equal", () => {
    expect(() => errors.throwIfNotEqual(2, 2, "New length should equal old length.")).to.not.throw();
  });
});

describe(nameof(errors, "throwIfTrue"), () => {
  it("should throw when true", () => {
    expect(() => errors.throwIfTrue(true, "message")).to.throw(errors.InvalidOperationError, "message");
  });

  it("should not throw when false", () => {
    expect(() => errors.throwIfTrue(false, "message")).to.not.throw();
  });
});

describe("with error context", () => {
  it("should get text", () => {
    const sourceFile = {
      getSourceFile() {
        return {
          getFilePath() {
            return "/test.ts" as StandardizedFilePath;
          },
          getFullText() {
            return `1;\nconst test = 123456789;\nasdf;`;
          },
        };
      },
      getStart() {
        return 16;
      },
    };
    expect(new errors.InvalidOperationError("Message.", sourceFile).message).to.equal(
      [
        "Message.",
        "",
        "/test.ts:2:14",
        "> 2 | const test = 123456789;",
      ].join("\n"),
    );
  });

  it("should get text when truncating start and end", () => {
    let pos = 80;
    const sourceFile = {
      getSourceFile() {
        return {
          getFilePath() {
            return "/test.ts" as StandardizedFilePath;
          },
          getFullText() {
            let text = "";
            for (let i = 0; i < 20; i++)
              text += `${i}123456789`;
            return text;
          },
        };
      },
      getStart() {
        return pos;
      },
    };
    expect(new errors.InvalidOperationError("Message.", sourceFile).message).to.equal(
      [
        "Message.",
        "",
        "/test.ts:1:81",
        "> 1 | ...34567895123456789612345678971234567898123456789912345678910123456789111234567...",
      ].join("\n"),
    );
    pos = 0;
    expect(new errors.InvalidOperationError("Message.", sourceFile).message).to.equal(
      [
        "Message.",
        "",
        "/test.ts:1:1",
        "> 1 | 01234567891123456789212345678931234567894123456789512345678961234567897123456...",
      ].join("\n"),
    );
    pos = 20 * 10;
    expect(new errors.InvalidOperationError("Message.", sourceFile).message).to.equal(
      [
        "Message.",
        "",
        "/test.ts:1:201",
        "> 1 | ...78916123456789171234567891812345678919123456789",
      ].join("\n"),
    );
  });
});
