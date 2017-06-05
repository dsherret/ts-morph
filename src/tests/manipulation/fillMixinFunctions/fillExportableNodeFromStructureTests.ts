import {expect} from "chai";
import {FunctionDeclaration} from "./../../../compiler";
import {ExportableStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillExportableNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: ExportableStructure, expectedCode: string) {
    const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startingCode);
    fillExportableNodeFromStructure(firstChild, structure);
    expect(firstChild.getText()).to.equal(expectedCode);
}

describe(nameof(fillExportableNodeFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("function myFunction() {}", {}, "function myFunction() {}");
    });

    it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
        doTest("export default function myFunction() {}", {}, "export default function myFunction() {}");
    });

    it("should modify when setting as export", () => {
        doTest("function myFunction() {}", { isExported: true }, "export function myFunction() {}");
    });

    it("should modify when setting as default export", () => {
        doTest("function myFunction() {}", { isDefaultExport: true }, "export default function myFunction() {}");
    });

    it("should be default export when setting as default export and exported", () => {
        doTest("function myFunction() {}", { isDefaultExport: true, isExported: true }, "export default function myFunction() {}");
    });
});
