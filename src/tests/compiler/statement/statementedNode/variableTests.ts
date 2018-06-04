import { expect } from "chai";
import { StatementedNode, VariableDeclaration, VariableDeclarationKind, VariableStatement } from "../../../../compiler";
import { VariableDeclarationStructure, VariableStatementStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.insertVariableStatements), () => {
        function doTest(startCode: string, index: number, structures: VariableStatementStructure[], expectedText: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertVariableStatements(index, structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should insert to an empty file", () => {
            doTest("", 0, [{
                isExported: true,
                declarationKind: VariableDeclarationKind.Var,
                declarations: [{
                    name: "Identifier",
                    initializer: `'test'`
                }, {
                    name: "Identifier2",
                    type: "number",
                    initializer: writer => writer.write("5")
                }]
            }], "export var Identifier = 'test', Identifier2: number = 5;\n");
        });

        it("should insert at the start with two new lines for a non-variable statement after", () => {
            doTest("namespace Identifier2 {\n}\n", 0, [{ declarations: [{ name: "Identifier1" }] }],
                "let Identifier1;\n\nnamespace Identifier2 {\n}\n");
        });

        it("should insert at the start with one new line for a variable statement after", () => {
            doTest("let Identifier2: string;\n", 0, [{ declarations: [{ name: "Identifier1", type: "string" }] }],
                "let Identifier1: string;\nlet Identifier2: string;\n");
        });

        it("should insert at the end of a file with two new lines for a non-variable statement before", () => {
            doTest("namespace Identifier1 {\n}\n", 1, [{ declarations: [{ name: "Identifier2" }] }],
                "namespace Identifier1 {\n}\n\nlet Identifier2;\n");
        });

        it("should insert in the middle of children", () => {
            doTest("namespace Identifier1 {\n}\n\nnamespace Identifier3 {\n}\n", 1, [{ declarations: [{ name: "Identifier2" }] }],
                "namespace Identifier1 {\n}\n\nlet Identifier2;\n\nnamespace Identifier3 {\n}\n");
        });

        it("should insert multiple", () => {
            doTest("namespace Identifier1 {\n}\n", 1, [{ declarations: [{ name: "Identifier2" }] }, { declarations: [{ name: "Identifier3" }] }],
                "namespace Identifier1 {\n}\n\nlet Identifier2;\nlet Identifier3;\n");
        });

        it("should have the expected text adding to non-source file", () => {
            const {sourceFile} = getInfoFromText("namespace Identifier {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertVariableStatements(0, [{ declarations: [{ name: "Identifier" }] }]);

            expect(sourceFile.getFullText()).to.equal("namespace Identifier {\n    let Identifier;\n}\n");
        });

        it("should insert everything from the structure", () => {
            const varStructure: MakeRequired<VariableDeclarationStructure> = {
                hasExclamationToken: true,
                name: "v",
                initializer: "5",
                type: "number"
            };
            const structure: MakeRequired<VariableStatementStructure> = {
                docs: [{ description: "Testing" }],
                hasDeclareKeyword: false,
                declarationKind: VariableDeclarationKind.Var,
                declarations: [varStructure],
                isDefaultExport: false,
                isExported: true
            };
            const expectedText = "/**\n * Testing\n */\nexport var v!: number = 5;\n";
            doTest("", 0, [structure], expectedText);
        });
    });

    describe(nameof<StatementedNode>(n => n.insertVariableStatement), () => {
        function doTest(startCode: string, index: number, structure: VariableStatementStructure, expectedText: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertVariableStatement(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(VariableStatement);
        }

        it("should insert", () => {
            doTest("namespace Identifier2 {\n}\n", 0, { declarations: [{ name: "Identifier1" }] }, "let Identifier1;\n\nnamespace Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addVariableStatements), () => {
        function doTest(startCode: string, structures: VariableStatementStructure[], expectedText: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addVariableStatements(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("namespace Identifier1 {\n}\n", [{ declarations: [{ name: "Identifier2" }] }, { declarations: [{ name: "Identifier3" }]}],
                "namespace Identifier1 {\n}\n\nlet Identifier2;\nlet Identifier3;\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addVariableStatement), () => {
        function doTest(startCode: string, structure: VariableStatementStructure, expectedText: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addVariableStatement(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(VariableStatement);
        }

        it("should add one", () => {
            doTest("namespace Identifier1 {\n}\n", { declarations: [{ name: "Identifier2" }] }, "namespace Identifier1 {\n}\n\nlet Identifier2;\n");
        });
    });

    const {sourceFile: variablesSourceFile} = getInfoFromText("var Identifier1;\nvar Identifier2, Identifier3;");
    describe(nameof<StatementedNode>(n => n.getVariableStatements), () => {
        const statements = variablesSourceFile.getVariableStatements();
        it("should have the expected number of statements", () => {
            expect(statements.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(statements[0]).to.be.instanceOf(VariableStatement);
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableStatement), () => {
        it("should get a variable statement when something matches", () => {
            const statement = variablesSourceFile.getVariableStatement(s => s.getDeclarations().length === 2)!;
            expect(statement.getDeclarations()[0].getName()).to.equal("Identifier2");
        });

        it("should return undefined when nothing matches", () => {
            const statement = variablesSourceFile.getVariableStatement(s => s.getDeclarations().length === 5);
            expect(statement).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableStatementOrThrow), () => {
        it("should get a variable statement when something matches", () => {
            const statement = variablesSourceFile.getVariableStatementOrThrow(s => s.getDeclarations().length === 2);
            expect(statement.getDeclarations()[0].getName()).to.equal("Identifier2");
        });

        it("should throw when nothing matches", () => {
            expect(() => variablesSourceFile.getVariableStatementOrThrow(s => s.getDeclarations().length === 5)).to.throw();
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableDeclarations), () => {
        const declarations = variablesSourceFile.getVariableDeclarations();
        it("should have the expected number of variable declarations", () => {
            expect(declarations.length).to.equal(3);
        });

        it("should have correct type", () => {
            expect(declarations[0]).to.be.instanceOf(VariableDeclaration);
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableDeclaration), () => {
        it("should get a variable declaration by a name", () => {
            expect(variablesSourceFile.getVariableDeclaration("Identifier2")!.getName()).to.equal("Identifier2");
        });

        it("should get a variable declaration by a search function", () => {
            expect(variablesSourceFile.getVariableDeclaration(c => c.getName() === "Identifier1")!.getName()).to.equal("Identifier1");
        });

        it("should return undefined when the variable declaration doesn't exist", () => {
            expect(variablesSourceFile.getVariableDeclaration("asdf")).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableDeclarationOrThrow), () => {
        it("should get a variable declaration by a name", () => {
            expect(variablesSourceFile.getVariableDeclarationOrThrow("Identifier2").getName()).to.equal("Identifier2");
        });

        it("should get a variableOrThrow declaration by a earch function", () => {
            expect(variablesSourceFile.getVariableDeclarationOrThrow(c => c.getName() === "Identifier1").getName()).to.equal("Identifier1");
        });

        it("should return undefined OrThrowwhen the variable declaration doesn't exist", () => {
            expect(() => variablesSourceFile.getVariableDeclarationOrThrow("asdf")).to.throw();
        });
    });
});
