import * as ts from "typescript";
import {expect} from "chai";
import {ShorthandPropertyAssignment, PropertyAssignment} from "./../../../../compiler";
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

    describe(nameof<ShorthandPropertyAssignment>(a => a.hasObjectAssignmentInitializer), () => {
        function doTest(text: string, expected: boolean) {
            const {shorthandPropertyAssignment} = getShorthandPropertyAssignemntExpression(text);
            expect(shorthandPropertyAssignment.hasObjectAssignmentInitializer()).to.equal(expected);
        }

        it("should be true when it does", () => {
            doTest("({prop = 5})", true);
        });

        it("should be false when not", () => {
            doTest("({prop})", false);
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

    describe(nameof<ShorthandPropertyAssignment>(a => a.setInitializer), () => {
        it("should set a new initializer", () => {
            const {sourceFile} = getInfoFromText("const t = { prop, prop2 }");
            const shortPropAssignment = sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ShorthandPropertyAssignment) as ShorthandPropertyAssignment;
            const propAssignment = shortPropAssignment.setInitializer("5");
            expect(propAssignment).to.be.instanceOf(PropertyAssignment);
            expect(shortPropAssignment.wasForgotten()).to.be.true;
            expect(sourceFile.getFullText()).to.equal("const t = { prop: 5, prop2 }");
        });
    });

    describe(nameof<ShorthandPropertyAssignment>(a => a.removeObjectAssignmentInitializer), () => {
        function doTest(start: string, expected: string) {
            const {sourceFile} = getInfoFromText(start);
            const shortPropAssignment = sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ShorthandPropertyAssignment) as ShorthandPropertyAssignment;
            shortPropAssignment.removeObjectAssignmentInitializer();
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should do nothing when it doesn't exist", () => {
            doTest("({ start })", "({ start })");
        });

        it("should remove when it does exist", () => {
            doTest("({ start = 5 })", "({ start })");
        });
    });
});
