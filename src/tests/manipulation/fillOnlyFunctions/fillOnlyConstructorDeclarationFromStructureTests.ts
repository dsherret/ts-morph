import {expect} from "chai";
import {ClassDeclaration} from "./../../../compiler";
import {ConstructorDeclarationSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillOnlyConstructorDeclarationFromStructure} from "./../../../manipulation/fillOnlyFunctions";

function doTest(startingCode: string, structure: ConstructorDeclarationSpecificStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
    const ctor = firstChild.getConstructors()[0];
    fillOnlyConstructorDeclarationFromStructure(ctor, structure);
    expect(sourceFile.getText()).to.equal(expectedCode);
}

describe(nameof(fillOnlyConstructorDeclarationFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("class identifier {\n  constructor() {}\n}", {}, "class identifier {\n  constructor() {}\n}");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<ConstructorDeclarationSpecificStructure> = {
            overloads: [{ parameters: [{ name: "param" }] }]
        };
        doTest("class identifier {\n  constructor() {}\n}", structure, "class identifier {\n  constructor(param);\n  constructor() {}\n}");
    });
});
