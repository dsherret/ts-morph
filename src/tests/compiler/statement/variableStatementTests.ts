import {expect} from "chai";
import {VariableStatement, VariableDeclarationType, VariableDeclaration} from "./../../../compiler";
import {VariableStatementStructure, VariableDeclarationStructure} from "./../../../structures";
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

    describe(nameof<VariableStatement>(d => d.insertDeclarations), () => {
        function doTest(startText: string, index: number, structures: VariableDeclarationStructure[], expectedText: string) {
            const {firstChild, sourceFile} = getInfoFromText<VariableStatement>(startText);
            const result = firstChild.insertDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert declarations at the beginning", () => {
            doTest("export var v4;", 0, [{ name: "v1" }, { name: "v2", type: "string" }, { name: "v3", initializer: "5" }],
                "export var v1, v2: string, v3 = 5, v4;");
        });

        it("should insert declarations in the middle", () => {
            doTest("var v1, v4;", 1, [{ name: "v2" }, { name: "v3", type: "number", initializer: "5" }],
                "var v1, v2, v3: number = 5, v4;");
        });

        it("should insert declarations at the end", () => {
            doTest("var v1;", 1, [{ name: "v2" }, { name: "v3" }],
                "var v1, v2, v3;");
        });
    });

    describe(nameof<VariableStatement>(d => d.insertDeclaration), () => {
        function doTest(startText: string, index: number, structure: VariableDeclarationStructure, expectedText: string) {
            const {firstChild, sourceFile} = getInfoFromText<VariableStatement>(startText);
            const result = firstChild.insertDeclaration(index, structure);
            expect(result).to.be.instanceOf(VariableDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert a declaration", () => {
            doTest("var v1, v3;", 1, { name: "v2" }, "var v1, v2, v3;");
        });
    });

    describe(nameof<VariableStatement>(d => d.addDeclarations), () => {
        function doTest(startText: string, structures: VariableDeclarationStructure[], expectedText: string) {
            const {firstChild, sourceFile} = getInfoFromText<VariableStatement>(startText);
            const result = firstChild.addDeclarations(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add declarations", () => {
            doTest("var v1;", [{ name: "v2" }, { name: "v3" }], "var v1, v2, v3;");
        });
    });

    describe(nameof<VariableStatement>(d => d.addDeclaration), () => {
        function doTest(startText: string, structure: VariableDeclarationStructure, expectedText: string) {
            const {firstChild, sourceFile} = getInfoFromText<VariableStatement>(startText);
            const result = firstChild.addDeclaration(structure);
            expect(result).to.be.instanceOf(VariableDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add a declaration", () => {
            doTest("var v1;", { name: "v2" }, "var v1, v2;");
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

        it("should add declarations", () => {
            doTest("const t = '';", { declarations: [{ name: "v2" }, { name: "v3" }] }, "const t = '', v2, v3;");
        });
    });
});
