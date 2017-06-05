import {expect} from "chai";
import {ClassDeclaration} from "./../../../compiler";
import {DecoratableStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillDecoratableNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: DecoratableStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
    fillDecoratableNodeFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillDecoratableNodeFromStructure), () => {
    it("should modify when setting", () => {
        doTest("class Identifier {}", { decorators: [{ name: "dec1" }, { name: "dec2" }] }, "@dec1\n@dec2\nclass Identifier {}");
    });

    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("class Identifier {}", {}, "class Identifier {}");
    });
});
