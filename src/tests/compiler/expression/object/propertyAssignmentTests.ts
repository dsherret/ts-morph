import { expect, assert } from "chai";
import { PropertyAssignment, ShorthandPropertyAssignment, ObjectLiteralExpression } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";
import { TypeGuards } from '../../../../utils/TypeGuards';

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
            const {sourceFile, descendant} = getInfoFromTextWithDescendant<ObjectLiteralExpression>(code, SyntaxKind.ObjectLiteralExpression);
            const prop1 = descendant.getPropertyOrThrow(propertyToRemove);
            prop1.remove();
            expect(descendant.getText()).to.equal(expectedCode)
        }
        
        it("should set the initializer", () => {
            doTest("const t = { prop1: 5, prop2: 6 };", "prop1", "{ prop2: 6 }")
        });

        // it("should set the initializer using a writer function", () => {
        //     const {sourceFile} = getInfoFromText("const t = { prop: 5, prop2: 6 };");
        //     const propAssignment = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.PropertyAssignment);
        //     propAssignment.setInitializer(writer => writer.write("{ t } as string"));
        //     expect(sourceFile.getFullText()).to.equal("const t = { prop: { t } as string, prop2: 6 };");
        // });
    });

});
