import {expect} from "chai";
import {VariableStatement, VariableDeclarationType} from "./../../../compiler";
import {VariableStatementStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(VariableStatement), () => {
    describe(nameof<VariableStatement>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getVariableStatements()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the variable statement", () => {
            doTest("const t = '';\nconst v = '';\nconst u = '';", 1, "const t = '';\nconst u = '';");
        });
    });

    describe(nameof<VariableStatement>(d => d.fill), () => {
        function doTest(text: string, fillStructure: Partial<VariableStatementStructure>, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getVariableStatements()[0].fill(fillStructure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set the variable declaration type", () => {
            doTest("const t = '';", { declarationType: VariableDeclarationType.Let }, "let t = '';");
        });
    });
});
