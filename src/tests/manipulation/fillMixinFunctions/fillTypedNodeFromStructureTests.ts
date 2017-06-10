import {expect} from "chai";
import {TypeAliasDeclaration} from "./../../../compiler";
import {TypedNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillTypedNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: TypedNodeStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<TypeAliasDeclaration>(startingCode);
    fillTypedNodeFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillTypedNodeFromStructure), () => {
    it("should modify when setting", () => {
        doTest("type myAlias = string;", { type: "number" }, "type myAlias = number;");
    });

    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("type myAlias = string;", {}, "type myAlias = string;");
    });
});
