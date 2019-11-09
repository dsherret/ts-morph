import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TryStatement, VariableDeclaration } from "../../../../compiler";
import { VariableDeclarationStructure, StructureKind } from "../../../../structures";
import { getInfoFromText, getInfoFromTextWithDescendant, OptionalTrivia } from "../../testHelpers";

describe(nameof(VariableDeclaration), () => {
    describe(nameof<VariableDeclaration>(d => d.remove), () => {
        describe("removing from variable statement", () => {
            function doTest(text: string, index: number, expectedText: string) {
                const { sourceFile } = getInfoFromText(text);
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
                const { sourceFile } = getInfoFromText(text);
                const tryStatement = sourceFile.getStatements()[0] as TryStatement;
                tryStatement.getCatchClauseOrThrow().getVariableDeclarationOrThrow().remove();
                expect(sourceFile.getFullText()).to.equal(expectedText);
            }

            it("should remove the variable declaration from a catch clause", () => {
                doTest("try {} catch (ex) {}", "try {} catch {}");
            });
        });
    });

    describe(nameof<VariableDeclaration>(d => d.getVariableStatement), () => {
        function doTest(startCode: string, expectedText: string | undefined) {
            const { descendant } = getInfoFromTextWithDescendant<VariableDeclaration>(startCode, SyntaxKind.VariableDeclaration);
            const statement = descendant.getVariableStatement();

            expect(statement?.getText()).to.equal(expectedText);
        }

        it("should get the variable statement when it exists", () => {
            doTest("const t = 5;", "const t = 5;");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest("for (const t of test) {}", undefined);
        });
    });

    describe(nameof<VariableDeclaration>(d => d.getVariableStatementOrThrow), () => {
        function doTest(startCode: string, expectedText: string | undefined) {
            const { descendant } = getInfoFromTextWithDescendant<VariableDeclaration>(startCode, SyntaxKind.VariableDeclaration);

            if (expectedText == null)
                expect(() => descendant.getVariableStatementOrThrow()).to.throw();
            else
                expect(descendant.getVariableStatementOrThrow().getText()).to.equal(expectedText);
        }

        it("should get the variable statement when it exists", () => {
            doTest("const t = 5;", "const t = 5;");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest("for (const t of test) {}", undefined);
        });
    });

    describe(nameof<VariableDeclaration>(d => d.set), () => {
        function doTest(startCode: string, structure: Partial<VariableDeclarationStructure>, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const variableDeclaration = sourceFile.getVariableDeclarations()[0];
            variableDeclaration.set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should fill both an exclamation token and type", () => {
            // needs to be tested because adding an exclamation token when there's no type will do nothing
            doTest("var t;", { hasExclamationToken: true, type: "string" }, "var t!: string;");
        });
    });

    describe(nameof<VariableDeclaration>(d => d.getStructure), () => {
        function doTest(startCode: string, expectedStructure: OptionalTrivia<MakeRequired<VariableDeclarationStructure>>) {
            const structure = getInfoFromText(startCode).sourceFile.getVariableDeclarations()[0].getStructure();
            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get from declaration with nothing", () => {
            doTest("var t;", {
                kind: StructureKind.VariableDeclaration,
                name: "t",
                initializer: undefined,
                type: undefined,
                hasExclamationToken: false
            });
        });

        it("should get from declaration with everything", () => {
            doTest("var t!: number = 5;", {
                kind: StructureKind.VariableDeclaration,
                name: "t",
                initializer: "5",
                type: "number",
                hasExclamationToken: true
            });
        });
    });
});
