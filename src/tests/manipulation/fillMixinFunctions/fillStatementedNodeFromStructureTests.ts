import {expect} from "chai";
import {StatementedStructure} from "./../../../structures";
import {getInfoFromText} from "./../../compiler/testHelpers";
import {fillStatementedNodeFromStructure} from "./../../../manipulation/fillMixinFunctions";

function doTest(startingCode: string, structure: StatementedStructure, expectedCode: string) {
    const {sourceFile} = getInfoFromText(startingCode);
    fillStatementedNodeFromStructure(sourceFile, structure);
    expect(sourceFile.getText()).to.equal(expectedCode);
}

describe(nameof(fillStatementedNodeFromStructure), () => {
    it("should not modify anything if the structure doesn't change anything", () => {
        doTest("", {}, "");
    });

    it("should modify when changed", () => {
        const structure: MakeRequired<StatementedStructure> = {
            classes: [{ name: "Identifier1" }],
            enums: [{ name: "Identifier2" }],
            functions: [{ name: "Identifier3" }],
            interfaces: [{ name: "Identifier4" }],
            namespaces: [{ name: "Identifier5" }],
            typeAliases: [{ name: "Identifier6", type: "string" }]
        };
        doTest("", structure,
            "class Identifier1 {\n}\n\nenum Identifier2 {\n}\n\nfunction Identifier3() {\n}\n\ninterface Identifier4 {\n}\n\nnamespace Identifier5 {\n}\n\n" +
            "type Identifier6 = string;\n");
    });
});
