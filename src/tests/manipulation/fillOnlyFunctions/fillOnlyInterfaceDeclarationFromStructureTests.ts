import {expect} from "chai";
import {InterfaceDeclaration} from "./../../../compiler";
import {InterfaceDeclarationSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillOnlyInterfaceDeclarationFromStructure} from "./../../../manipulation/fillOnlyFunctions";

function doTest(startingCode: string, structure: InterfaceDeclarationSpecificStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(startingCode);
    fillOnlyInterfaceDeclarationFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillOnlyInterfaceDeclarationFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("interface Identifier {\n}", {}, "interface Identifier {\n}");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<InterfaceDeclarationSpecificStructure> = {
            constructSignatures: [{ returnType: "string" }],
            properties: [{ name: "p" }],
            methods: [{ name: "m" }]
        };
        doTest("interface Identifier {\n}", structure, "interface Identifier {\n    new(): string;\n    p;\n    m();\n}");
    });
});
