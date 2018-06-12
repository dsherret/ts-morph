import { expect } from "chai";
import { PropertyAssignment, ShorthandPropertyAssignment, ObjectLiteralExpression } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";
import { TypeGuards } from "../../../../utils";

describe(nameof(PropertyAssignment), () => {
    describe(nameof<PropertyAssignment>(p => p.removeInitializer), () => {
        it("should remove the property assignment and change into a shorthand property assignment", () => {
            const {sourceFile} = getInfoFromText("const t = { /* test */prop: 5, prop2: 6 };");
            const propAssignment = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.PropertyAssignment);
            const shorthandPropAssignment = propAssignment.removeInitializer();
            expect(shorthandPropAssignment).to.be.instanceOf(ShorthandPropertyAssignment);
            expect(sourceFile.getFullText()).to.equal("const t = { /* test */prop, prop2: 6 };");
            expect(propAssignment.wasForgotten()).to.be.true;
        });
    });

    describe(nameof<PropertyAssignment>(p => p.setInitializer), () => {
        it("should set the initializer", () => {
            const {sourceFile} = getInfoFromText("const t = { prop: 5, prop2: 6 };");
            const propAssignment = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.PropertyAssignment);
            propAssignment.setInitializer("{ t } as string");
            expect(sourceFile.getFullText()).to.equal("const t = { prop: { t } as string, prop2: 6 };");
        });

        it("should set the initializer using a writer function", () => {
            const {sourceFile} = getInfoFromText("const t = { prop: 5, prop2: 6 };");
            const propAssignment = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.PropertyAssignment);
            propAssignment.setInitializer(writer => writer.write("{ t } as string"));
            expect(sourceFile.getFullText()).to.equal("const t = { prop: { t } as string, prop2: 6 };");
        });
    });

    describe(nameof<PropertyAssignment>(p => p.remove), () => {
        function doTest(code: string, propertyToRemove: string, expectedCode: string) {
            const { sourceFile, descendant } = getInfoFromTextWithDescendant<ObjectLiteralExpression>(code,
                SyntaxKind.ObjectLiteralExpression);

            descendant.getPropertyOrThrow(propertyToRemove).remove();
            expect(descendant.getText()).to.equal(expectedCode);
        }

        it("should remove the first", () => {
            doTest("const t = { prop1: 1, prop2: 2 };", "prop1", "{ prop2: 2 }");
        });

        it("should remove in the middle", () => {
            doTest("const t = { prop1: 1, prop2: 2, };", "prop2", "{ prop1: 1 }");
        });

        it("should remove the last", () => {
            doTest("const t = { prop1: 1, prop2: 2, prop3: 3 };", "prop3",
                "{ prop1: 1, prop2: 2 }");
        });

        it("should remove the first when on separate lines", () => {
            doTest(`const t = {\n    prop1: 1,\n    prop2: 2,\n    prop3: 3\n};`, "prop1",
                `{\n    prop2: 2,\n    prop3: 3\n}`);
        });

        it("should remove in the middle when on separate lines", () => {
            doTest(`const t = {\n    prop1: 1,\n    prop2: 2,\n    prop3: 3\n};`, "prop2",
                `{\n    prop1: 1,\n    prop3: 3\n}`);
        });

        it("should remove the last when on separate lines", () => {
            doTest(`const t = {\n    prop1: 1,\n    prop2: 2,\n    prop3: 3\n};`, "prop3",
                `{\n    prop1: 1,\n    prop2: 2\n}`);
        });
    });
});
