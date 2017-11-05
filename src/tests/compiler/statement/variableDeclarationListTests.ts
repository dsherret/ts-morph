import {expect} from "chai";
import {VariableStatement, VariableDeclarationList, VariableDeclarationType} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

// todo: need to add tests here for getMembers
describe(nameof(VariableDeclarationList), () => {
    describe(nameof<VariableDeclarationList>(d => d.getDeclarationType), () => {
        function doTest(code: string, expectedType: VariableDeclarationType) {
            const {firstChild} = getInfoFromText<VariableStatement>(code);
            expect(firstChild.getDeclarationList().getDeclarationType()).to.equal(expectedType);
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

    describe(nameof<VariableDeclarationList>(d => d.getDeclarationTypeKeyword), () => {
        function doTest(code: string, expectedType: VariableDeclarationType) {
            const {firstChild} = getInfoFromText<VariableStatement>(code);
            expect(firstChild.getDeclarationList().getDeclarationTypeKeyword().getText()).to.equal(expectedType);
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

    describe(nameof<VariableDeclarationList>(d => d.setDeclarationType), () => {
        function doTest(code: string, newType: VariableDeclarationType, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<VariableStatement>(code);
            firstChild.getDeclarationList().setDeclarationType(newType);
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
});
