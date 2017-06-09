import {expect} from "chai";
import {NamespaceDeclaration} from "./../../../compiler";
import {NamespaceSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillOnlyNamespaceDeclarationFromStructure} from "./../../../manipulation/fillOnlyFunctions";

function doTest(startingCode: string, structure: NamespaceSpecificStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<NamespaceDeclaration>(startingCode);
    fillOnlyNamespaceDeclarationFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillOnlyNamespaceDeclarationFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("namespace Identifier {\n}", {}, "namespace Identifier {\n}");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<NamespaceSpecificStructure> = {
            hasModuleKeyword: true
        };
        doTest("namespace Identifier {\n}", structure, "module Identifier {\n}");
    });
});
