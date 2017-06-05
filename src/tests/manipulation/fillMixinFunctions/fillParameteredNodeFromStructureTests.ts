import {expect} from "chai";
import {FunctionDeclaration} from "./../../../compiler";
import {ParameteredStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillParameteredNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: ParameteredStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startingCode);
    fillParameteredNodeFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillParameteredNodeFromStructure), () => {
    it("should modify when setting", () => {
        doTest("function identifier() {}", { parameters: [{ name: "param" }] }, "function identifier(param) {}");
    });

    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("function identifier() {}", {}, "function identifier() {}");
    });
});
