import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { PropertyAssignment, ShorthandPropertyAssignment, ObjectLiteralExpression } from "../../../../../compiler";
import { PropertyAssignmentStructure, StructureKind } from "../../../../../structures";
import { getInfoFromText, getInfoFromTextWithDescendant, OptionalKindAndTrivia, OptionalTrivia } from "../../../testHelpers";

describe(nameof(PropertyAssignment), () => {
    describe(nameof<PropertyAssignment>(p => p.removeInitializer), () => {
        it("should remove the property assignment and change into a shorthand property assignment", () => {
            const { sourceFile } = getInfoFromText("const t = { /* test */prop: 5, prop2: 6 };");
            const propAssignment = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.PropertyAssignment);
            const shorthandPropAssignment = propAssignment.removeInitializer();
            expect(shorthandPropAssignment).to.be.instanceOf(ShorthandPropertyAssignment);
            expect(sourceFile.getFullText()).to.equal("const t = { /* test */prop, prop2: 6 };");
            expect(propAssignment.wasForgotten()).to.be.true;
        });
    });

    describe(nameof<PropertyAssignment>(p => p.setInitializer), () => {
        it("should set the initializer", () => {
            const { sourceFile } = getInfoFromText("const t = { prop: 5, prop2: 6 };");
            const propAssignment = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.PropertyAssignment);
            propAssignment.setInitializer("{ t } as string");
            expect(sourceFile.getFullText()).to.equal("const t = { prop: { t } as string, prop2: 6 };");
        });

        it("should set the initializer using a writer function", () => {
            const { sourceFile } = getInfoFromText("const t = { prop: 5, prop2: 6 };");
            const propAssignment = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.PropertyAssignment);
            propAssignment.setInitializer(writer => writer.write("{ t } as string"));
            expect(sourceFile.getFullText()).to.equal("const t = { prop: { t } as string, prop2: 6 };");
        });
    });

    describe(nameof<PropertyAssignment>(p => p.remove), () => {
        function doTest(code: string, propertyToRemove: string, expectedCode: string) {
            const { descendant } = getInfoFromTextWithDescendant<ObjectLiteralExpression>(code, SyntaxKind.ObjectLiteralExpression);

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
            doTest(
                "const t = { prop1: 1, prop2: 2, prop3: 3 };",
                "prop3",
                "{ prop1: 1, prop2: 2 }"
            );
        });

        it("should remove the first when on separate lines", () => {
            doTest(
                `const t = {\n    prop1: 1,\n    prop2: 2,\n    prop3: 3\n};`,
                "prop1",
                `{\n    prop2: 2,\n    prop3: 3\n}`
            );
        });

        it("should remove in the middle when on separate lines", () => {
            doTest(
                `const t = {\n    prop1: 1,\n    prop2: 2,\n    prop3: 3\n};`,
                "prop2",
                `{\n    prop1: 1,\n    prop3: 3\n}`
            );
        });

        it("should remove the last when on separate lines", () => {
            doTest(
                `const t = {\n    prop1: 1,\n    prop2: 2,\n    prop3: 3\n};`,
                "prop3",
                `{\n    prop1: 1,\n    prop2: 2\n}`
            );
        });
    });

    describe(nameof<PropertyAssignment>(p => p.set), () => {
        function test(code: string, structure: Partial<PropertyAssignmentStructure>, expectedText: string) {
            const { descendant, sourceFile } = getInfoFromTextWithDescendant<PropertyAssignment>(code, SyntaxKind.PropertyAssignment);
            expect(descendant.set(structure).wasForgotten()).to.be.false;
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should not change when nothing is specified", () => {
            const code = "const t = { prop1: 1 };";
            test(code, {}, code);
        });

        it("should set when everything is specified", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<PropertyAssignmentStructure>> = {
                name: "NewName",
                initializer: "5"
            };
            test("const t = { prop1: 1 };", structure, "const t = { NewName: 5 };");
        });

        it("should remove initializer when specifying undefined", () => {
            test("const t = { prop: 1 };", { initializer: undefined }, "const t = { prop };");
        });
    });

    describe(nameof<PropertyAssignment>(p => p.getStructure), () => {
        function test(code: string, expectedStructure: OptionalTrivia<MakeRequired<PropertyAssignmentStructure>>) {
            const { descendant } = getInfoFromTextWithDescendant<PropertyAssignment>(code, SyntaxKind.PropertyAssignment);
            expect(descendant.getStructure()).to.deep.equals(expectedStructure);
        }

        it("should get the structure", () => {
            test("const t = { prop1: 1};", {
                kind: StructureKind.PropertyAssignment,
                name: "prop1",
                initializer: "1"
            });
        });
    });
});
