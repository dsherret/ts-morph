import { expect } from "chai";
import { ClassDeclaration, PropertyDeclaration, ReadonlyableNode } from "../../../../compiler";
import { ReadonlyableNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ReadonlyableNode), () => {
    function getInfoWithFirstPropertyFromText(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return { ...result, firstProperty: result.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    describe(nameof<ReadonlyableNode>(d => d.isReadonly), () => {
        it("should be readonly when readonly", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass {\nreadonly prop: string;}\n");
            expect(firstProperty.isReadonly()).to.be.true;
        });

        it("should not be readonly when not readonly", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(firstProperty.isReadonly()).to.be.false;
        });
    });

    describe(nameof<ReadonlyableNode>(d => d.getReadonlyKeyword), () => {
        it("should be get the readonly keyword when readonly", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass {\nreadonly prop: string;}\n");
            expect(firstProperty.getReadonlyKeyword()!.getText()).to.equal("readonly");
        });

        it("should return undefined when not readonly", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(firstProperty.getReadonlyKeyword()).to.be.undefined;
        });
    });

    describe(nameof<ReadonlyableNode>(d => d.getReadonlyKeywordOrThrow), () => {
        it("should be get the readonly keyword when readonly", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass {\nreadonly prop: string;}\n");
            expect(firstProperty.getReadonlyKeywordOrThrow().getText()).to.equal("readonly");
        });

        it("should throw when not readonly", () => {
            const { firstProperty } = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(() => firstProperty.getReadonlyKeywordOrThrow()).to.throw();
        });
    });

    describe(nameof<ReadonlyableNode>(n => n.setIsReadonly), () => {
        it("should set as readonly when not readonly", () => {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>("class MyClass { prop: string; }");
            (firstChild.getInstanceProperties()[0] as PropertyDeclaration).setIsReadonly(true);
            expect(sourceFile.getText()).to.equal("class MyClass { readonly prop: string; }");
        });

        it("should set as not readonly when readonly", () => {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>("class MyClass { readonly prop: string; }");
            (firstChild.getInstanceProperties()[0] as PropertyDeclaration).setIsReadonly(false);
            expect(sourceFile.getText()).to.equal("class MyClass { prop: string; }");
        });
    });

    describe(nameof<PropertyDeclaration>(n => n.set), () => {
        function doTest(startCode: string, structure: ReadonlyableNodeStructure, expectedCode: string) {
            const { firstProperty, sourceFile } = getInfoWithFirstPropertyFromText(startCode);
            firstProperty.set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify when not set and structure empty", () => {
            doTest("class MyClass { prop: string; }", {}, "class MyClass { prop: string; }");
        });

        it("should not modify when set and structure empty", () => {
            doTest("class MyClass { readonly prop: string; }", {}, "class MyClass { readonly prop: string; }");
        });

        it("should modify when setting true", () => {
            doTest("class MyClass { prop: string; }", { isReadonly: true }, "class MyClass { readonly prop: string; }");
        });
    });

    describe(nameof<PropertyDeclaration>(p => p.getStructure), () => {
        function doTest(startCode: string, isReadonly: boolean) {
            const { firstProperty, sourceFile } = getInfoWithFirstPropertyFromText(startCode);
            expect(firstProperty.getStructure().isReadonly).to.equal(isReadonly);
        }

        it("should be false when not", () => {
            doTest("class Identifier { prop: string; }", false);
        });

        it("should be true when has one", () => {
            doTest("class Identifier { readonly prop: string; }", true);
        });
    });
});
