import {expect} from "chai";
import {ClassDeclaration} from "./../../../compiler";
import {DocumentationableNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillDocumentationableNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: DocumentationableNodeStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
    fillDocumentationableNodeFromStructure(firstChild, structure);
    expect(sourceFile.getFullText()).to.equal(expectedCode);
}

describe(nameof(fillDocumentationableNodeFromStructure), () => {
    it("should modify when setting", () => {
        doTest("class Identifier {}", { docs: [{ description: "Desc1" }, { description: "Desc2" }] }, "/**\n * Desc1\n */\n/**\n * Desc2\n */\nclass Identifier {}");
    });

    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("class Identifier {}", {}, "class Identifier {}");
    });
});
