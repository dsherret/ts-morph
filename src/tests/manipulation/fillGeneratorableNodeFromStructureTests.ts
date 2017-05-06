import {expect} from "chai";
import {ExportableNode, FunctionDeclaration} from "./../../compiler";
import {getInfoFromText} from "./../compiler/testHelpers";
import {fillGeneratorableNodeFromStructure} from "./../../manipulation/fillMixinFunctions";

describe(nameof(fillGeneratorableNodeFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() {}");
        fillGeneratorableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("function myFunction() {}");
    });

    it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function* myFunction() {}");
        fillGeneratorableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("function* myFunction() {}");
    });

    it("should modify when setting as async", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() {}");
        fillGeneratorableNodeFromStructure(sourceFile, firstChild, { isGenerator: true });
        expect(firstChild.getText(sourceFile)).to.equal("function* myFunction() {}");
    });
});
