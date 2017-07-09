import {expect} from "chai";
import {FunctionDeclaration} from "./../../../compiler";
import {FunctionDeclarationSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillOnlyFunctionDeclarationFromStructure} from "./../../../manipulation/fillOnlyFunctions";

function doTest(startingCode: string, structure: FunctionDeclarationSpecificStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startingCode);
    fillOnlyFunctionDeclarationFromStructure(firstChild, structure);
    expect(sourceFile.getText()).to.equal(expectedCode);
}

describe(nameof(fillOnlyFunctionDeclarationFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("function identifier() {\n}", {}, "function identifier() {\n}");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<FunctionDeclarationSpecificStructure> = {
            overloads: [{ returnType: "string" }]
        };
        doTest("function identifier() {\n}", structure, "function identifier(): string;\nfunction identifier() {\n}");
    });
});
