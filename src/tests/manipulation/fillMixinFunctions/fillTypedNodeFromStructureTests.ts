import {expect} from "chai";
import {TypeAliasDeclaration} from "./../../../compiler";
import {TypedStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillTypedNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: TypedStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<TypeAliasDeclaration>(startingCode);
    fillTypedNodeFromStructure(sourceFile, firstChild, structure);
    expect(firstChild.getText(sourceFile)).to.equal(expectedCode);
}

describe(nameof(fillTypedNodeFromStructure), () => {
    it("should modify when setting", () => {
        doTest("type myAlias = string;", { type: "number" }, "type myAlias = number;");
    });

    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("type myAlias = string;", {}, "type myAlias = string;");
    });
});
