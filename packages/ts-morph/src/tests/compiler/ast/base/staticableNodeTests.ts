import { expect } from "chai";
import { ClassDeclaration, MethodDeclaration, PropertyDeclaration, StaticableNode, Node } from "../../../../compiler";
import { StaticableNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(StaticableNode), () => {
    const { sourceFile: mainSourceFile } = getInfoFromText("class MyClass { static prop: string; prop2: string; }");
    const classDec = mainSourceFile.getClasses()[0];
    const staticProp = classDec.getStaticProperties()[0];
    const instanceProp = classDec.getInstanceProperties()[0] as PropertyDeclaration;

    describe(nameof<StaticableNode>(n => n.isStatic), () => {
        it("should be static when static", () => {
            expect(staticProp.isStatic()).to.be.true;
        });

        it("should not be static when not static", () => {
            expect(instanceProp.isStatic()).to.be.false;
        });
    });

    describe(nameof<StaticableNode>(n => n.getStaticKeyword), () => {
        it("should have a static keyword when static", () => {
            expect(staticProp.getStaticKeyword()!.getText()).to.equal("static");
        });

        it("should not have a static keyword when not static", () => {
            expect(instanceProp.getStaticKeyword()).to.be.undefined;
        });
    });

    describe(nameof<StaticableNode>(n => n.getStaticKeywordOrThrow), () => {
        it("should have a static keyword when static", () => {
            expect(staticProp.getStaticKeywordOrThrow().getText()).to.equal("static");
        });

        it("should throw when not static", () => {
            expect(() => instanceProp.getStaticKeywordOrThrow()).to.throw();
        });
    });

    describe(nameof<StaticableNode>(n => n.setIsStatic), () => {
        it("should set as static when not static", () => {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>("class MyClass { prop: string; }");
            (firstChild.getInstanceProperties()[0] as PropertyDeclaration).setIsStatic(true);
            expect(sourceFile.getText()).to.equal("class MyClass { static prop: string; }");
        });

        it("should set as not static when static", () => {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>("class MyClass { static prop: string; }");
            firstChild.getStaticProperties()[0].setIsStatic(false);
            expect(sourceFile.getText()).to.equal("class MyClass { prop: string; }");
        });
    });

    function getFirstMethod(code: string) {
        const result = getInfoFromText<ClassDeclaration>(code);
        const firstMethod = result.firstChild.getMembers().filter(m => Node.isMethodDeclaration(m))[0] as MethodDeclaration;
        return { firstMethod, ...result };
    }

    describe(nameof<MethodDeclaration>(n => n.set), () => {
        function doTest(startCode: string, structure: StaticableNodeStructure, expectedCode: string) {
            const { firstMethod, sourceFile } = getFirstMethod(startCode);
            firstMethod.set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("class MyClass { method() {} }", {}, "class MyClass { method() {} }");
        });

        it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
            doTest("class MyClass { static method() {} }", {}, "class MyClass { static method() {} }");
        });

        it("should modify when setting as has declare keyword", () => {
            doTest("class MyClass { method() {} }", { isStatic: true }, "class MyClass { static method() {} }");
        });
    });

    describe(nameof<MethodDeclaration>(n => n.getStructure), () => {
        function doTest(startCode: string, isStatic: boolean) {
            const { firstMethod, sourceFile } = getFirstMethod(startCode);
            expect(firstMethod.getStructure().isStatic).to.equal(isStatic);
        }

        it("should be false when not static", () => {
            doTest("class MyClass { method() {} }", false);
        });

        it("should be true when static", () => {
            doTest("class MyClass { static method() {} }", true);
        });
    });
});
