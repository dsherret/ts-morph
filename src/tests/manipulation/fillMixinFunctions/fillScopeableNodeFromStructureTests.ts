import {expect} from "chai";
import {ClassDeclaration, PropertyDeclaration, Scope} from "./../../../compiler";
import {ScopeableStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillScopeableNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function getFirstProperty(code: string) {
    const result = getInfoFromText<ClassDeclaration>(code);
    const firstProperty = result.firstChild.getInstanceProperties()[0] as PropertyDeclaration;
    return {firstProperty, ...result};
}

function doTest(startCode: string, structure: ScopeableStructure, expectedCode: string) {
    const {firstProperty, sourceFile} = getFirstProperty(startCode);
    fillScopeableNodeFromStructure(sourceFile, firstProperty, structure);
    expect(sourceFile.getText()).to.equal(expectedCode);
}

describe(nameof(fillScopeableNodeFromStructure), () => {
    it("should not modify when not set and structure empty", () => {
        doTest("class MyClass { prop: string; }", {}, "class MyClass { prop: string; }");
    });

    it("should not modify when set and structure empty", () => {
        doTest("class MyClass { public prop: string; }", {}, "class MyClass { public prop: string; }");
    });

    it("should modify when setting", () => {
        doTest("class MyClass { prop: string; }", { scope: Scope.Protected }, "class MyClass { protected prop: string; }");
    });
});
