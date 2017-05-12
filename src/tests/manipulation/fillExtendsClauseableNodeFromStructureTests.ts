import {expect} from "chai";
import {ExportableNode, InterfaceDeclaration} from "./../../compiler";
import {ExtendsClauseableStructure} from "./../../structures";
import {getInfoFromText} from "./../compiler/testHelpers";
import {fillExtendsClauseableNodeFromStructure} from "./../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: ExtendsClauseableStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(startingCode);
    fillExtendsClauseableNodeFromStructure(sourceFile, firstChild, structure);
    expect(firstChild.getText(sourceFile)).to.equal(expectedCode);
}

describe(nameof(fillExtendsClauseableNodeFromStructure), () => {
    it("should modify when setting one", () => {
        doTest("interface MyClass {}", { extends: ["Test"] }, "interface MyClass extends Test {}");
    });

    it("should modify when setting two", () => {
        doTest("interface MyClass {}", { extends: ["Test", "Test2"] }, "interface MyClass extends Test, Test2 {}");
    });

    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("interface MyClass {}", {}, "interface MyClass {}");
    });

    it("should not modify anything if the structure has an empty array", () => {
        doTest("interface MyClass {}", { extends: [] }, "interface MyClass {}");
    });
});
