import { expect } from "chai";
import { VariableDeclaration, VariableDeclarationKind, VariableStatement } from "../../../../compiler";
import { VariableDeclarationStructure, VariableStatementStructure, OptionalKind, StructureKind } from "../../../../structures";
import { getInfoFromText, fillStructures } from "../../testHelpers";

describe(nameof(VariableStatement), () => {
    describe(nameof<VariableStatement>(d => d.getDeclarationKind), () => {
        function doTest(code: string, expectedType: VariableDeclarationKind) {
            const { firstChild } = getInfoFromText<VariableStatement>(code);
            expect(firstChild.getDeclarationKind()).to.equal(expectedType);
        }

        it("should get var for a var variable", () => {
            doTest("var myVar;", VariableDeclarationKind.Var);
        });

        it("should get let for a let variable", () => {
            doTest("let myVar;", VariableDeclarationKind.Let);
        });

        it("should get const for a const variable", () => {
            doTest("const myVar = 3;", VariableDeclarationKind.Const);
        });
    });

    describe(nameof<VariableStatement>(d => d.getDeclarationKindKeyword), () => {
        function doTest(code: string, expectedType: VariableDeclarationKind) {
            const { firstChild } = getInfoFromText<VariableStatement>(code);
            expect(firstChild.getDeclarationKindKeyword().getText()).to.equal(expectedType);
        }

        it("should get var for a var variable", () => {
            doTest("var myVar;", VariableDeclarationKind.Var);
        });

        it("should get let for a let variable", () => {
            doTest("let myVar;", VariableDeclarationKind.Let);
        });

        it("should get const for a const variable", () => {
            doTest("const myVar = 3;", VariableDeclarationKind.Const);
        });
    });

    describe(nameof<VariableStatement>(d => d.setDeclarationKind), () => {
        function doTest(code: string, newType: VariableDeclarationKind, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableStatement>(code);
            firstChild.setDeclarationKind(newType);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not change the type when it is the same", () => {
            doTest("var myVar;", VariableDeclarationKind.Var, "var myVar;");
        });

        it("should change to let", () => {
            doTest("var myVar;", VariableDeclarationKind.Let, "let myVar;");
        });

        it("should change to const", () => {
            doTest("var myVar;", VariableDeclarationKind.Const, "const myVar;");
        });

        it("should change to var", () => {
            doTest("let myVar;", VariableDeclarationKind.Var, "var myVar;");
        });
    });

    describe(nameof<VariableStatement>(d => d.insertDeclarations), () => {
        function doTest(startText: string, index: number, structures: OptionalKind<VariableDeclarationStructure>[], expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableStatement>(startText);
            const result = firstChild.insertDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert declarations at the beginning", () => {
            doTest("export var v4;", 0, [{ name: "v1" }, { name: "v2", type: "string" }, { name: "v3", initializer: "5" }],
                "export var v1, v2: string, v3 = 5, v4;");
        });

        it("should insert declarations in the middle", () => {
            doTest("var v1, v4;", 1, [{ name: "v2" }, { name: "v3", type: "number", initializer: "5" }], "var v1, v2, v3: number = 5, v4;");
        });

        it("should insert declarations at the end", () => {
            doTest("var v1;", 1, [{ name: "v2" }, { name: "v3" }], "var v1, v2, v3;");
        });
    });

    describe(nameof<VariableStatement>(d => d.insertDeclaration), () => {
        function doTest(startText: string, index: number, structure: OptionalKind<VariableDeclarationStructure>, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableStatement>(startText);
            const result = firstChild.insertDeclaration(index, structure);
            expect(result).to.be.instanceOf(VariableDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert a declaration", () => {
            doTest("var v1, v3;", 1, { name: "v2" }, "var v1, v2, v3;");
        });
    });

    describe(nameof<VariableStatement>(d => d.addDeclarations), () => {
        function doTest(startText: string, structures: OptionalKind<VariableDeclarationStructure>[], expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableStatement>(startText);
            const result = firstChild.addDeclarations(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add declarations", () => {
            doTest("var v1;", [{ name: "v2" }, { name: "v3" }], "var v1, v2, v3;");
        });
    });

    describe(nameof<VariableStatement>(d => d.addDeclaration), () => {
        function doTest(startText: string, structure: OptionalKind<VariableDeclarationStructure>, expectedText: string) {
            const { firstChild, sourceFile } = getInfoFromText<VariableStatement>(startText);
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
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getVariableStatements()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the variable statement", () => {
            doTest("const t = '';\nconst v = '';\nconst u = '';", 1, "const t = '';\nconst u = '';");
        });
    });

    describe(nameof<VariableStatement>(d => d.set), () => {
        function doTest(text: string, fillStructure: Partial<VariableStatementStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getVariableStatements()[0].set(fillStructure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set the variable declaration kind", () => {
            doTest("const t = '';", { declarationKind: VariableDeclarationKind.Let }, "let t = '';");
        });

        it("should replace the existing declarations when setting new ones", () => {
            doTest("const t = '';", { declarations: [{ name: "v2" }, { name: "v3" }] }, "const v2, v3;");
        });

        it("should remove the statement when specifying an empty declarations array", () => {
            doTest("const t = '';", { declarations: [] }, "");
        });
    });

    describe(nameof<VariableStatement>(d => d.getStructure), () => {
        function doTest(text: string, expected: VariableStatementStructure) {
            const structure = getInfoFromText(text).sourceFile.getVariableStatements()[0].getStructure();
            expect(structure).to.deep.equal(fillStructures.variableStatement(expected));
        }

        it("should get for statement with nothing", () => {
            doTest("declare const a;", {
                kind: StructureKind.VariableStatement,
                isExported: false,
                isDefaultExport: false,
                hasDeclareKeyword: true,
                docs: [],
                declarationKind: VariableDeclarationKind.Const,
                declarations: [{ name: "a" }]
            });
        });

        it("should get for statement with everything", () => {
            const code = `
/** Test */
export var test;
`;
            doTest(code, {
                kind: StructureKind.VariableStatement,
                isExported: true,
                isDefaultExport: false,
                hasDeclareKeyword: false,
                docs: [{ description: "Test" }],
                declarationKind: VariableDeclarationKind.Var,
                declarations: [{ name: "test" }]
            });
        });
    });
});
