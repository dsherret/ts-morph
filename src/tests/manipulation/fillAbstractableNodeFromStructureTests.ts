import {expect} from "chai";
import {ExportableNode, ClassDeclaration} from "./../../compiler";
import {getInfoFromText} from "./../compiler/testHelpers";
import {fillAbstractableNodeFromStructure} from "./../../manipulation/fillMixinFunctions";

describe(nameof(fillAbstractableNodeFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class MyClass {}");
        fillAbstractableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("class MyClass {}");
    });

    it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
        const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("abstract class MyClass {}");
        fillAbstractableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("abstract class MyClass {}");
    });

    it("should modify when setting as abstract", () => {
        const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class MyClass {}");
        fillAbstractableNodeFromStructure(sourceFile, firstChild, { isAbstract: true });
        expect(firstChild.getText(sourceFile)).to.equal("abstract class MyClass {}");
    });
});
