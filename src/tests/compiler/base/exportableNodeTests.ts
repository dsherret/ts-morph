import {expect} from "chai";
import {ExportableNode} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ExportableNode), () => {
    const {sourceFile} = getInfoFromText("export var exportedVar = 1; var myExplicitVar: string;");
    const statements = sourceFile.getVariableStatements();
    const exportedStatement = statements[0];
    const notExportedStatement = statements[1];

    describe(nameof<ExportableNode>(n => n.hasExportKeyword), () => {
        describe("exported node", () => {
            it("should have an export keyword", () => {
                expect(exportedStatement.hasExportKeyword()).to.be.true;
            });
        });

        describe("not exported node", () => {
            it("should not have an export keyword", () => {
                expect(notExportedStatement.hasExportKeyword()).to.be.false;
            });
        });
    });

    describe(nameof<ExportableNode>(n => n.getExportKeyword), () => {
        describe("exported node", () => {
            it("should have an export keyword", () => {
                expect(exportedStatement.getExportKeyword()!.getText()).to.equal("export");
            });
        });

        describe("not exported node", () => {
            it("should not have an export keyword", () => {
                expect(notExportedStatement.getExportKeyword()).to.be.undefined;
            });
        });
    });
});
