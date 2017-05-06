import {expect} from "chai";
import {ExportableNode, ClassDeclaration} from "./../../compiler";
import {getInfoFromText} from "./../compiler/testHelpers";
import {fillAmbientableNodeFromStructure} from "./../../manipulation/fillMixinFunctions";

describe(nameof(fillAmbientableNodeFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class MyClass {}");
        fillAmbientableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("class MyClass {}");
    });

    it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
        const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("declare class MyClass {}");
        fillAmbientableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("declare class MyClass {}");
    });

    it("should modify when setting as has declare keyword", () => {
        const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class MyClass {}");
        fillAmbientableNodeFromStructure(sourceFile, firstChild, { hasDeclareKeyword: true });
        expect(firstChild.getText(sourceFile)).to.equal("declare class MyClass {}");
    });
});
