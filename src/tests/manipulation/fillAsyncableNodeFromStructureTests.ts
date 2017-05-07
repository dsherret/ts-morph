import {expect} from "chai";
import {ExportableNode, FunctionDeclaration} from "./../../compiler";
import {AsyncableStructure} from "./../../structures";
import {getInfoFromText} from "./../compiler/testHelpers";
import {fillAsyncableNodeFromStructure} from "./../../manipulation/fillMixinFunctions";

function doTest(startCode: string, structure: AsyncableStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
    fillAsyncableNodeFromStructure(sourceFile, firstChild, structure);
    expect(firstChild.getText(sourceFile)).to.equal(expectedCode);
}

describe(nameof(fillAsyncableNodeFromStructure), () => {
    it("should modify when false and setting true", () => {
        doTest("function myFunction() {}", { isAsync: true }, "async function myFunction() {}");
    });

    it("should modify when true and setting false", () => {
        doTest("async function myFunction() {}", { isAsync: false }, "function myFunction() {}");
    });

    it("should not modify when false and setting false", () => {
        doTest("function myFunction() {}", { isAsync: false }, "function myFunction() {}");
    });

    it("should not modify when true and setting true", () => {
        doTest("async function myFunction() {}", { isAsync: true }, "async function myFunction() {}");
    });

    it("should not modify when false and no property provided", () => {
        doTest("function myFunction() {}", {}, "function myFunction() {}");
    });

    it("should not modify when true and no property provided", () => {
        doTest("async function myFunction() {}", {}, "async function myFunction() {}");
    });
});
