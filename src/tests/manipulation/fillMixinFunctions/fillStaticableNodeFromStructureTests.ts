import {expect} from "chai";
import {ClassDeclaration, MethodDeclaration} from "./../../../compiler";
import {StaticableStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillStaticableNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function getFirstMethod(code: string) {
    const result = getInfoFromText<ClassDeclaration>(code);
    const firstMethod = result.firstChild.getAllMembers().filter(m => m.isMethodDeclaration())[0] as MethodDeclaration;
    return {firstMethod, ...result};
}

function doTest(startCode: string, structure: StaticableStructure, expectedCode: string) {
    const {firstMethod, sourceFile} = getFirstMethod(startCode);
    fillStaticableNodeFromStructure(sourceFile, firstMethod, structure);
    expect(sourceFile.getText()).to.equal(expectedCode);
}

describe(nameof(fillStaticableNodeFromStructure), () => {
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
