import {expect} from "chai";
import {ClassDeclaration} from "./../../../compiler";
import {MethodDeclarationSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillOnlyMethodDeclarationFromStructure} from "./../../../manipulation/fillOnlyFunctions";

function doTest(startingCode: string, structure: MethodDeclarationSpecificStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
    const method = firstChild.getInstanceMethods()[0];
    fillOnlyMethodDeclarationFromStructure(method, structure);
    expect(sourceFile.getText()).to.equal(expectedCode);
}

describe(nameof(fillOnlyMethodDeclarationFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("class identifier {\n  method() {}\n}", {}, "class identifier {\n  method() {}\n}");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<MethodDeclarationSpecificStructure> = {
            overloads: [{ parameters: [{ name: "param" }] }]
        };
        doTest("class identifier {\n  method() {}\n}", structure, "class identifier {\n  method(param);\n  method() {}\n}");
    });
});
