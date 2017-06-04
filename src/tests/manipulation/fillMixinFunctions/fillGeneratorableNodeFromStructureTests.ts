import {expect} from "chai";
import {FunctionDeclaration} from "./../../../compiler";
import {GeneratorableStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillGeneratorableNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startCode: string, structure: GeneratorableStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
    fillGeneratorableNodeFromStructure(sourceFile, firstChild, structure);
    expect(firstChild.getText(sourceFile)).to.equal(expectedCode);
}

describe(nameof(fillGeneratorableNodeFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("function myFunction() {}", {}, "function myFunction() {}");
    });

    it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
        doTest("function* myFunction() {}", {}, "function* myFunction() {}");
    });

    it("should modify when setting as async", () => {
        doTest("function myFunction() {}", { isGenerator: true }, "function* myFunction() {}");
    });
});
