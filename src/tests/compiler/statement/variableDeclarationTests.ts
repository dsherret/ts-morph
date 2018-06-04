import { expect } from "chai";
import { TryStatement, VariableDeclaration } from "../../../compiler";
import { VariableDeclarationStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(VariableDeclaration), () => {
    describe(nameof<VariableDeclaration>(d => d.remove), () => {
        describe("removing from variable statement", () => {
            function doTest(text: string, index: number, expectedText: string) {
                const {sourceFile} = getInfoFromText(text);
                sourceFile.getVariableDeclarations()[index].remove();
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove the statement when the only declaration", () => {
                doTest("const t = '';\nconst v = '';\nconst u = '';", 1, "const t = '';\nconst u = '';");
            });

            it("should remove the variable declaration when the first", () => {
                doTest("const t = 1, u = 2;", 0, "const u = 2;");
            });

            it("should remove the variable declaration when in the middle", () => {
                doTest("const t = 1, u = 2, v = 3;", 1, "const t = 1, v = 3;");
            });

            it("should remove the variable declaration when the last", () => {
                doTest("const t = 1, u = 2;", 1, "const t = 1;");
            });
        });

        describe("removing from catch clause", () => {
            function doTest(text: string, expectedText: string) {
                const {sourceFile} = getInfoFromText(text);
                const tryStatement = sourceFile.getStatements()[0] as TryStatement;
                tryStatement.getCatchClauseOrThrow().getVariableDeclarationOrThrow().remove();
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove the variable declaration from a catch clause", () => {
                doTest("try {} catch (ex) {}", "try {} catch {}");
            });
        });
    });

    describe(nameof<VariableDeclaration>(d => d.fill), () => {
        function doTest(startCode: string, structure: Partial<VariableDeclarationStructure>, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const variableDeclaration = sourceFile.getVariableDeclarations()[0];
            variableDeclaration.fill(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should fill both an exclamation token and type", () => {
            // needs to be tested because adding an exclamation token when there's no type will do nothing
            doTest("var t;", { hasExclamationToken: true, type: "string" }, "var t!: string;");
        });
    });
});
