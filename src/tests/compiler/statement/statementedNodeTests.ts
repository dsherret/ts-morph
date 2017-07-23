import {expect} from "chai";
import {StatementedNode, SourceFile} from "./../../../compiler";
import {StatementedNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<SourceFile>(s => s.fill), () => {
        function doTest(startingCode: string, structure: StatementedNodeStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startingCode);
            sourceFile.fill(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("", {}, "");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<StatementedNodeStructure> = {
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
});
