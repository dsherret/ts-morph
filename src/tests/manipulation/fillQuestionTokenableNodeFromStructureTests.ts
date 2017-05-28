import {expect} from "chai";
import {InterfaceDeclaration, PropertyDeclaration} from "./../../compiler";
import {QuestionTokenableStructure} from "./../../structures";
import {getInfoFromText} from "./../compiler/testHelpers";
import {fillQuestionTokenableNodeFromStructure} from "./../../manipulation/fillMixinFunctions";

function getFirstProperty(code: string) {
    const result = getInfoFromText<InterfaceDeclaration>(code);
    const firstProperty = result.firstChild.getProperties()[0];
    return {firstProperty, ...result};
}

function doTest(startCode: string, structure: QuestionTokenableStructure, expectedCode: string) {
    const {firstProperty, sourceFile} = getFirstProperty(startCode);
    fillQuestionTokenableNodeFromStructure(sourceFile, firstProperty, structure);
    expect(sourceFile.getText()).to.equal(expectedCode);
}

describe(nameof(fillQuestionTokenableNodeFromStructure), () => {
    it("should not modify when not set and structure empty", () => {
        doTest("interface Identifier { prop: string; }", {}, "interface Identifier { prop: string; }");
    });

    it("should not modify when set and structure empty", () => {
        doTest("interface Identifier { prop?: string; }", {}, "interface Identifier { prop?: string; }");
    });

    it("should modify when setting true", () => {
        doTest("interface Identifier { prop: string; }", { hasQuestionToken: true }, "interface Identifier { prop?: string; }");
    });
});
