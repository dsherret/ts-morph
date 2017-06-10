import {expect} from "chai";
import {EnumDeclaration} from "./../../../compiler";
import {EnumDeclarationSpecificStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillOnlyEnumDeclarationFromStructure} from "./../../../manipulation/fillOnlyFunctions";

function doTest(startingCode: string, structure: EnumDeclarationSpecificStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<EnumDeclaration>(startingCode);
    fillOnlyEnumDeclarationFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillOnlyEnumDeclarationFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("enum Identifier {\n}", {}, "enum Identifier {\n}");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<EnumDeclarationSpecificStructure> = {
            isConst: true,
            members: [{
                name: "member"
            }]
        };
        doTest("enum Identifier {\n}", structure, "const enum Identifier {\n    member\n}");
    });
});
