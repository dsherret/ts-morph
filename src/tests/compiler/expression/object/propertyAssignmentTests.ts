import { expect, assert } from "chai";
import { PropertyAssignment, ShorthandPropertyAssignment, ObjectLiteralExpression, ObjectLiteralElementLike, Node } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";
import { TypeGuards } from "../../../../utils/TypeGuards";

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

    describe(nameof<ObjectLiteralElementLike>(p => p.remove), () => {
        function doTest(code: string, propertyToRemove: string | ((p: Node) => boolean), expectedCode: string) {
            const {sourceFile, descendant} = getInfoFromTextWithDescendant<ObjectLiteralExpression>(code,
                SyntaxKind.ObjectLiteralExpression);
            if (typeof propertyToRemove === "string")
                descendant.getPropertyOrThrow(propertyToRemove).remove();
            else
                descendant.getProperties().find(propertyToRemove)!.remove();
            expect(descendant.getText()).to.equal(expectedCode);
        }

        it("should remove first property assignment", () => {
            doTest("const t = { prop1: 5, prop2: 6 };", "prop1", "{ prop2: 6 }");
        });

        it("should remove last property assignment and preserve trailing comma", () => {
            doTest("const t = { prop1: [1,2,3], prop2: [['hello']], };", "prop2", "{ prop1: [1,2,3], }");
        });

        it("should remove property assignment in the middle", () => {
            doTest("const t = { prop1: {prop1: 2}, prop2: {prop2: 3}, foo: {bar: '98989'} };", "prop2",
                "{ prop1: {prop1: 2}, foo: {bar: '98989'} }");
        });

        it("should remove ShorthandPropertyAssignment", () => {
            doTest("const prop2 = 2; const t = { prop1: {prop1: 2}, prop2, foo: {bar: '98989'} };", "prop2",
                "{ prop1: {prop1: 2}, foo: {bar: '98989'} }");
        });

        it("should remove SpreadAssignment", () => {
            doTest("const t = { prop1: {prop1: 2}, ... {a: 2}, foo: {bar: '98989'} };", TypeGuards.isSpreadAssignment,
                "{ prop1: {prop1: 2}, foo: {bar: '98989'} }");
        });
    });

});
