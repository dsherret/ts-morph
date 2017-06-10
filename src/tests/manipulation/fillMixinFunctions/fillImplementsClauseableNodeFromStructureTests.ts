import {expect} from "chai";
import {ClassDeclaration} from "./../../../compiler";
import {ImplementsClauseableNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillImplementsClauseableNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: ImplementsClauseableNodeStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
    fillImplementsClauseableNodeFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillImplementsClauseableNodeFromStructure), () => {
    it("should modify when setting one", () => {
        doTest("class MyClass {}", { implements: ["Test"] }, "class MyClass implements Test {}");
    });

    it("should modify when setting two", () => {
        doTest("class MyClass {}", { implements: ["Test", "Test2"] }, "class MyClass implements Test, Test2 {}");
    });

    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("class MyClass {}", {}, "class MyClass {}");
    });

    it("should not modify anything if the structure has an empty array", () => {
        doTest("class MyClass {}", { implements: [] }, "class MyClass {}");
    });
});
