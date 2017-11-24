import * as ts from "typescript";
import {expect} from "chai";
import {ShorthandPropertyAssignment} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(ShorthandPropertyAssignment), () => {
    function getShorthandPropertyAssignemntExpression(text: string) {
        const opts = getInfoFromText(text);
        const shorthandPropertyAssignment = opts.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ShorthandPropertyAssignment) as ShorthandPropertyAssignment;
        return {
            shorthandPropertyAssignment,
            ...opts
        };
    }

    describe(nameof<ShorthandPropertyAssignment>(a => a.getObjectAssignmentInitializer), () => {
        it("should get the object assignment initializer", () => {
            const {shorthandPropertyAssignment} = getShorthandPropertyAssignemntExpression("({prop = 5})");
            expect(shorthandPropertyAssignment.getObjectAssignmentInitializer()!.getText()).to.equal("5");
        });

        it("should return undefined when the object assignment initializer doesn't exist", () => {
            const {shorthandPropertyAssignment} = getShorthandPropertyAssignemntExpression("({prop})");
            expect(shorthandPropertyAssignment.getObjectAssignmentInitializer()).to.be.undefined;
        });
    });

    describe(nameof<ShorthandPropertyAssignment>(a => a.getObjectAssignmentInitializerOrThrow), () => {
        it("should get the object assignment initializer", () => {
            const {shorthandPropertyAssignment} = getShorthandPropertyAssignemntExpression("({prop = 5})");
            expect(shorthandPropertyAssignment.getObjectAssignmentInitializerOrThrow().getText()).to.equal("5");
        });

        it("should return undefined when the object assignment initializer doesn't exist", () => {
            const {shorthandPropertyAssignment} = getShorthandPropertyAssignemntExpression("({prop})");
            expect(() => shorthandPropertyAssignment.getObjectAssignmentInitializerOrThrow()).to.throw();
        });
    });

    describe(nameof<ShorthandPropertyAssignment>(a => a.getEqualsToken), () => {
        it("should get the equals token", () => {
            const {shorthandPropertyAssignment} = getShorthandPropertyAssignemntExpression("({prop = 5})");
            expect(shorthandPropertyAssignment.getEqualsToken()!.getText()).to.equal("=");
        });

        it("should return undefined when the equals token doesn't exist", () => {
            const {shorthandPropertyAssignment} = getShorthandPropertyAssignemntExpression("({prop})");
            expect(shorthandPropertyAssignment.getEqualsToken()).to.be.undefined;
        });
    });

    describe(nameof<ShorthandPropertyAssignment>(a => a.getEqualsTokenOrThrow), () => {
        it("should get the equals token", () => {
            const {shorthandPropertyAssignment} = getShorthandPropertyAssignemntExpression("({prop = 5})");
            expect(shorthandPropertyAssignment.getEqualsTokenOrThrow().getText()).to.equal("=");
        });

        it("should return undefined when the equals token doesn't exist", () => {
            const {shorthandPropertyAssignment} = getShorthandPropertyAssignemntExpression("({prop})");
            expect(() => shorthandPropertyAssignment.getEqualsTokenOrThrow()).to.throw();
        });
    });
});
