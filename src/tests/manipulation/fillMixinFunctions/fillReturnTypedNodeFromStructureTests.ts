import {expect} from "chai";
import {FunctionDeclaration} from "./../../../compiler";
import {ReturnTypedStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillReturnTypedNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: ReturnTypedStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startingCode);
    fillReturnTypedNodeFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillReturnTypedNodeFromStructure), () => {
    it("should modify when setting", () => {
        doTest("function Identifier() {}", { returnType: "number" }, "function Identifier(): number {}");
    });

    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("function Identifier() {}", { }, "function Identifier() {}");
    });
});
