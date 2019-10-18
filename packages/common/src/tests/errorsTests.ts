import { expect } from "chai";
import { errors } from "../errors";
import { ts } from "../typescript";

describe("helpers", () => {
    describe(nameof(errors.throwIfNotType), () => {
        it("should throw when not the same type", () => {
            expect(() => errors.throwIfNotType(4, "string", "argName")).to.throw(errors.ArgumentTypeError,
                "Argument Error (argName): Expected type 'string', but was 'number'.");
        });

        it("should not throw when the same type", () => {
            expect(() => errors.throwIfNotType("", "string", "argName")).to.not.throw();
        });
    });

    describe(nameof(errors.throwIfWhitespaceOrNotString), () => {
        it("should throw when not a string", () => {
            expect(() => errors.throwIfWhitespaceOrNotString(4 as any, "argName")).to.throw(errors.ArgumentTypeError,
                "Argument Error (argName): Expected type 'string', but was 'number'.");
        });

        it("should throw when null", () => {
            expect(() => errors.throwIfWhitespaceOrNotString(null as any, "argName")).to.throw(errors.ArgumentTypeError,
                "Argument Error (argName): Expected type 'string', but was 'object'.");
        });

        it("should throw when whitespace string", () => {
            expect(() => errors.throwIfWhitespaceOrNotString(" ", "argName")).to.throw(errors.ArgumentNullOrWhitespaceError,
                "Argument Error (argName): Cannot be null or whitespace.");
        });

        it("should throw when string that's not a whitespace string", () => {
            expect(() => errors.throwIfWhitespaceOrNotString("str", "argName")).to.not.throw();
        });
    });

    describe(nameof(errors.throwIfOutOfRange), () => {
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

    describe(nameof(errors.throwIfRangeOutOfRange), () => {
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

    describe(nameof(errors.throwIfNegative), () => {
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

    describe(nameof(errors.throwNotImplementedForSyntaxKindError), () => {
        let result: Error;
        try {
            errors.throwNotImplementedForSyntaxKindError(ts.SyntaxKind.EnumDeclaration);
        } catch (ex) {
            result = ex;
        }

        it("should return a NotImplementedError", () => {
            expect(result).to.be.instanceOf(errors.NotImplementedError);
        });

        it("should have the correct message", () => {
            expect(result.message).to.equal("Not implemented feature for syntax kind 'EnumDeclaration'.");
        });
    });

    describe(nameof(errors.throwIfNotEqual), () => {
        it("should throw when not equal", () => {
            expect(() => errors.throwIfNotEqual(1, 2, "New length should equal old length.")).to.throw(errors.InvalidOperationError,
                "Expected 1 to equal 2. New length should equal old length.");
        });

        it("should not throw when equal", () => {
            expect(() => errors.throwIfNotEqual(2, 2, "New length should equal old length.")).to.not.throw();
        });
    });

    describe(nameof(errors.throwIfTrue), () => {
        it("should throw when true", () => {
            expect(() => errors.throwIfTrue(true, "message")).to.throw(errors.InvalidOperationError, "message");
        });

        it("should not throw when false", () => {
            expect(() => errors.throwIfTrue(false, "message")).to.not.throw();
        });
    });
});
