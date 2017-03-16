import {expect} from "chai";
import * as ts from "typescript";
import * as errors from "./../../errors";

describe("helpers", () => {
    describe(nameof(errors.throwIfNotType), () => {
        it("should throw when not the same type", () => {
            expect(() => errors.throwIfNotType(4, "string", "argName")).to.throw(errors.ArgumentTypeError, "Argument 'argName' expects type 'string', but was 'number'.");
        });

        it("should not throw when the same type", () => {
            expect(() => errors.throwIfNotType("", "string", "argName")).to.not.throw();
        });
    });

    describe(nameof(errors.throwIfNotStringOrWhitespace), () => {
        it("should throw when not a string", () => {
            expect(() => errors.throwIfNotStringOrWhitespace(4 as any, "argName")).to.throw(errors.ArgumentTypeError, "Argument 'argName' expects type 'string', but was 'number'.");
        });

        it("should throw when null", () => {
            expect(() => errors.throwIfNotStringOrWhitespace(null as any, "argName")).to.throw(errors.ArgumentTypeError, "Argument 'argName' expects type 'string', but was 'object'.");
        });

        it("should throw when whitespace string", () => {
            expect(() => errors.throwIfNotStringOrWhitespace(" ", "argName")).to.throw(errors.ArgumentNullOrWhitespaceError, "Argument 'argName' was null or whitespace.");
        });

        it("should throw when string that's not a whitespace string", () => {
            expect(() => errors.throwIfNotStringOrWhitespace("str", "argName")).to.not.throw();
        });
    });

    describe(nameof(errors.getNotImplementedForSyntaxKindError), () => {
        const result = errors.getNotImplementedForSyntaxKindError(ts.SyntaxKind.EnumDeclaration);

        it("should return a NotImplementedError", () => {
            expect(result).to.be.instanceOf(errors.NotImplementedError);
        });

        it("should have the correct message", () => {
            expect(result.message).to.equal("Not implemented feature for syntax kind 'EnumDeclaration'.");
        });
    });
});
