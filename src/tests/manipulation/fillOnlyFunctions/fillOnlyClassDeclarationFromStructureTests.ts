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
        doTest("class Identifier {\n}", {}, "class Identifier {\n}");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<ClassSpecificStructure> = {
            ctor: {},
            properties: [{ name: "p" }],
            methods: [{ name: "m" }]
        };
        doTest("class Identifier {\n}", structure, "class Identifier {\n    constructor() {\n    }\n\n    p;\n\n    m() {\n    }\n}");
    });
});
