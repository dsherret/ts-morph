import { expect } from "chai";
import { PropertyAssignment, ShorthandPropertyAssignment, ObjectLiteralExpression, Node } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(ShorthandPropertyAssignment), () => {
    function getShorthandPropertyAssignemntExpression(text: string) {
        const opts = getInfoFromText(text);
        const shorthandPropertyAssignment = opts.sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ShorthandPropertyAssignment);
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
            const shortPropAssignment = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ShorthandPropertyAssignment);
            const propAssignment = shortPropAssignment.setInitializer("5");
            expect(propAssignment).to.be.instanceOf(PropertyAssignment);
            expect(shortPropAssignment.wasForgotten()).to.be.true;
            expect(sourceFile.getFullText()).to.equal("const t = { prop: 5, prop2 }");
        });
    });

    describe(nameof<ShorthandPropertyAssignment>(a => a.removeObjectAssignmentInitializer), () => {
        function doTest(start: string, expected: string) {
            const {sourceFile} = getInfoFromText(start);
            const shortPropAssignment = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ShorthandPropertyAssignment);
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

    describe(nameof<ShorthandPropertyAssignment>(p => p.remove), () => {
        function doTest(code: string, propertyToRemove: string, expectedCode: string) {
            const { sourceFile, descendant } = getInfoFromTextWithDescendant<ObjectLiteralExpression>(code,
                SyntaxKind.ObjectLiteralExpression);

            descendant.getPropertyOrThrow(propertyToRemove).remove();
            expect(descendant.getText()).to.equal(expectedCode);
        }

        it("should remove the first", () => {
            doTest("const t = { prop1, prop2 };", "prop1", "{ prop2 }");
        });

        it("should remove in the middle", () => {
            doTest("const t = { prop1, prop2, };", "prop2", "{ prop1 }");
        });

        it("should remove the last", () => {
            doTest("const t = { prop1, prop2, prop3 };", "prop3",
                "{ prop1, prop2 }");
        });

        it("should remove the first when on separate lines", () => {
            doTest(`const t = {\n    prop1,\n    prop2,\n    prop3\n};`, "prop1",
                `{\n    prop2,\n    prop3\n}`);
        });

        it("should remove in the middle when on separate lines", () => {
            doTest(`const t = {\n    prop1,\n    prop2,\n    prop3\n};`, "prop2",
                `{\n    prop1,\n    prop3\n}`);
        });

        it("should remove the last when on separate lines", () => {
            doTest(`const t = {\n    prop1,\n    prop2,\n    prop3\n};`, "prop3",
                `{\n    prop1,\n    prop2\n}`);
        });
    });
});
