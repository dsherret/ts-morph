import {expect} from "chai";
import * as ts from "typescript";
import * as errors from "./../../errors";
import {getInfoFromText} from "./../compiler/testHelpers";

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

    describe(nameof(errors.throwIfNotSyntaxKind), () => {
        const {firstChild} = getInfoFromText("class Identifier {}");

        it("should throw when not the expected syntax kind and no message is specified", () => {
            expect(() => errors.throwIfNotSyntaxKind(firstChild, ts.SyntaxKind.AbstractKeyword))
                .to.throw(errors.NotImplementedError, "Expected node to be syntax kind AbstractKeyword, but was ClassDeclaration");
        });

        it("should throw when not the expected syntax kind and a message is specified", () => {
            expect(() => errors.throwIfNotSyntaxKind(firstChild, ts.SyntaxKind.AbstractKeyword, "message"))
                .to.throw(errors.NotImplementedError, "message");
        });

        it("should not throw when is the expected syntax kind", () => {
            expect(() => errors.throwIfNotSyntaxKind(firstChild, ts.SyntaxKind.ClassDeclaration))
                .to.not.throw();
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

        it("should throw when outside the range, but not the message range", () => {
            expect(() => errors.throwIfOutOfRange(21, [1, 10], "arg", [20, 22])).to.throw();
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
