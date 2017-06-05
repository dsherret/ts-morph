import {expect} from "chai";
import {ClassDeclaration} from "./../../../compiler";
import {ClassSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillOnlyClassDeclarationFromStructure} from "./../../../manipulation/fillOnlyFunctions";

function doTest(startingCode: string, structure: ClassSpecificStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
    fillOnlyClassDeclarationFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillOnlyClassDeclarationFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("class MyClass {\n}", {}, "class MyClass {\n}");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<ClassSpecificStructure> = {
            properties: [{ name: "p" }],
            ctor: {},
            methods: [{ name: "m" }]
        };
        doTest("class MyClass {\n}", structure, "class MyClass {\n    p;\n\n    constructor() {\n    }\n\n    m() {\n    }\n}");
    });
});
