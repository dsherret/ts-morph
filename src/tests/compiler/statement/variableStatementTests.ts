import {expect} from "chai";
import {VariableStatement, VariableDeclarationType} from "./../../../compiler";
import {VariableStatementStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(VariableStatement), () => {
    describe(nameof<VariableStatement>(d => d.getDeclarationType), () => {
        function doTest(code: string, expectedType: VariableDeclarationType) {
            const {firstChild} = getInfoFromText<VariableStatement>(code);
            expect(firstChild.getDeclarationType()).to.equal(expectedType);
        }

        it("should get var for a var variable", () => {
            doTest("var myVar;", VariableDeclarationType.Var);
        });

        it("should get let for a let variable", () => {
            doTest("let myVar;", VariableDeclarationType.Let);
        });

        it("should get const for a const variable", () => {
            doTest("const myVar = 3;", VariableDeclarationType.Const);
        });
    });

    describe(nameof<VariableStatement>(d => d.getDeclarationTypeKeyword), () => {
        function doTest(code: string, expectedType: VariableDeclarationType) {
            const {firstChild} = getInfoFromText<VariableStatement>(code);
            expect(firstChild.getDeclarationTypeKeyword().getText()).to.equal(expectedType);
        }

        it("should get var for a var variable", () => {
            doTest("var myVar;", VariableDeclarationType.Var);
        });

        it("should get let for a let variable", () => {
            doTest("let myVar;", VariableDeclarationType.Let);
        });

        it("should get const for a const variable", () => {
            doTest("const myVar = 3;", VariableDeclarationType.Const);
        });
    });

    describe(nameof<VariableStatement>(d => d.setDeclarationType), () => {
        function doTest(code: string, newType: VariableDeclarationType, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<VariableStatement>(code);
            firstChild.setDeclarationType(newType);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change the type when it is the same", () => {
            doTest("var myVar;", VariableDeclarationType.Var, "var myVar;");
        });

        it("should change to let", () => {
            doTest("var myVar;", VariableDeclarationType.Let, "let myVar;");
        });

        it("should change to const", () => {
            doTest("var myVar;", VariableDeclarationType.Const, "const myVar;");
        });

        it("should change to var", () => {
            doTest("let myVar;", VariableDeclarationType.Var, "var myVar;");
        });
    });

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
