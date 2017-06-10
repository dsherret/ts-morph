import {expect} from "chai";
import {TypeAliasDeclaration} from "./../../../compiler";
import {TypeParameteredNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillTypeParameteredNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: TypeParameteredNodeStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<TypeAliasDeclaration>(startingCode);
    fillTypeParameteredNodeFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillTypeParameteredNodeFromStructure), () => {
    it("should modify when setting", () => {
        doTest("type myAlias = string;", { typeParameters: [{ name: "T" }] }, "type myAlias<T> = string;");
    });

    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("type myAlias = string;", {}, "type myAlias = string;");
    });
});
