import {expect} from "chai";
import {InterfaceDeclaration} from "./../../../compiler";
import {InterfaceSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillOnlyInterfaceDeclarationFromStructure} from "./../../../manipulation/fillOnlyFunctions";

function doTest(startingCode: string, structure: InterfaceSpecificStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(startingCode);
    fillOnlyInterfaceDeclarationFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillOnlyInterfaceDeclarationFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("interface Identifier {\n}", {}, "interface Identifier {\n}");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<InterfaceSpecificStructure> = {
            properties: [{ name: "p" }],
            methods: [{ name: "m" }]
        };
        doTest("interface Identifier {\n}", structure, "interface Identifier {\n    p;\n    m();\n}");
    });
});
