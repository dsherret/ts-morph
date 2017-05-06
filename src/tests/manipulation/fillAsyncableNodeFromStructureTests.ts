import {expect} from "chai";
import {ExportableNode, FunctionDeclaration} from "./../../compiler";
import {getInfoFromText} from "./../compiler/testHelpers";
import {fillAsyncableNodeFromStructure} from "./../../manipulation/fillMixinFunctions";

describe(nameof(fillAsyncableNodeFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() {}");
        fillAsyncableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("function myFunction() {}");
    });

    it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("async function myFunction() {}");
        fillAsyncableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("async function myFunction() {}");
    });

    it("should modify when setting as async", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() {}");
        fillAsyncableNodeFromStructure(sourceFile, firstChild, { isAsync: true });
        expect(firstChild.getText(sourceFile)).to.equal("async function myFunction() {}");
    });
});
