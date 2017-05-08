import {expect} from "chai";
import {ExportableNode, ClassDeclaration} from "./../../compiler";
import {AmbientableStructure} from "./../../structures";
import {getInfoFromText} from "./../compiler/testHelpers";
import {fillAmbientableNodeFromStructure} from "./../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: AmbientableStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
    fillAmbientableNodeFromStructure(sourceFile, firstChild, structure);
    expect(firstChild.getText(sourceFile)).to.equal(expectedCode);
}

describe(nameof(fillAmbientableNodeFromStructure), () => {
    it("should not modify when not set and structure empty", () => {
        doTest("class MyClass {}", {}, "class MyClass {}");
    });

    it("should not modify when set and structure empty", () => {
        doTest("declare class MyClass {}", {}, "declare class MyClass {}");
    });

    it("should modify when setting true", () => {
        doTest("class MyClass {}", { hasDeclareKeyword: true }, "declare class MyClass {}");
    });
});
