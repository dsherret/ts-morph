import {expect} from "chai";
import {ExportableNode, FunctionDeclaration} from "./../../compiler";
import {getInfoFromText} from "./../compiler/testHelpers";
import {fillExportableNodeFromStructure} from "./../../manipulation/fillMixinFunctions";

describe(nameof(fillExportableNodeFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() {}");
        fillExportableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("function myFunction() {}");
    });

    it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("export default function myFunction() {}");
        fillExportableNodeFromStructure(sourceFile, firstChild, {});
        expect(firstChild.getText(sourceFile)).to.equal("export default function myFunction() {}");
    });

    it("should modify when setting as export", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() {}");
        fillExportableNodeFromStructure(sourceFile, firstChild, { isExported: true });
        expect(firstChild.getText(sourceFile)).to.equal("export function myFunction() {}");
    });

    it("should modify when setting as default export", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() {}");
        fillExportableNodeFromStructure(sourceFile, firstChild, { isDefaultExport: true });
        expect(firstChild.getText(sourceFile)).to.equal("export default function myFunction() {}");
    });

    it("should be default export when setting as default export and exported", () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() {}");
        fillExportableNodeFromStructure(sourceFile, firstChild, { isDefaultExport: true, isExported: true });
        expect(firstChild.getText(sourceFile)).to.equal("export default function myFunction() {}");
    });
});
