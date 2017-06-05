import {expect} from "chai";
import {ClassDeclaration, PropertyDeclaration} from "./../../../compiler";
import {ReadonlyableStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillReadonlyableNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function getFirstProperty(code: string) {
    const result = getInfoFromText<ClassDeclaration>(code);
    const firstProperty = result.firstChild.getInstanceProperties()[0] as PropertyDeclaration;
    return {firstProperty, ...result};
}

function doTest(startCode: string, structure: ReadonlyableStructure, expectedCode: string) {
    const {firstProperty, sourceFile} = getFirstProperty(startCode);
    fillReadonlyableNodeFromStructure(firstProperty, structure);
    expect(sourceFile.getText()).to.equal(expectedCode);
}

describe(nameof(fillReadonlyableNodeFromStructure), () => {
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
