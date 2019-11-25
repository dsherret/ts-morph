import { expect } from "chai";
import { StatementedNode, VariableDeclaration, VariableDeclarationKind, VariableStatement, Node } from "../../../../../compiler";
import { VariableDeclarationStructure, VariableStatementStructure } from "../../../../../structures";
import { getInfoFromText, OptionalKindAndTrivia } from "../../../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(n => n.insertVariableStatements), () => {
        function doTest(startCode: string, index: number, structures: OptionalKindAndTrivia<VariableStatementStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
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
            doTest("namespace Identifier2 {\n}\n", 0, [{ declarations: [{ name: "Identifier1" }] }], "let Identifier1;\n\nnamespace Identifier2 {\n}\n");
        });

        it("should insert at the start with one new line for a variable statement after", () => {
            doTest("let Identifier2: string;\n", 0, [{ declarations: [{ name: "Identifier1", type: "string" }] }],
                "let Identifier1: string;\nlet Identifier2: string;\n");
        });

        it("should insert at the end of a file with two new lines for a non-variable statement before", () => {
            doTest("namespace Identifier1 {\n}\n", 1, [{ declarations: [{ name: "Identifier2" }] }], "namespace Identifier1 {\n}\n\nlet Identifier2;\n");
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
            const { sourceFile } = getInfoFromText("namespace Identifier {\n}\n");
            const namespaceDec = sourceFile.getNamespaces()[0];
            namespaceDec.insertVariableStatements(0, [{ declarations: [{ name: "Identifier" }] }]);

            expect(sourceFile.getFullText()).to.equal("namespace Identifier {\n    let Identifier;\n}\n");
        });

        it("should insert everything from the structure", () => {
            const varStructure: OptionalKindAndTrivia<MakeRequired<VariableDeclarationStructure>> = {
                hasExclamationToken: true,
                name: "v",
                initializer: "5",
                type: "number"
            };
            const structure: OptionalKindAndTrivia<MakeRequired<VariableStatementStructure>> = {
                docs: [{ description: "Testing" }],
                hasDeclareKeyword: false,
                declarationKind: VariableDeclarationKind.Var,
                declarations: [varStructure],
                isDefaultExport: false,
                isExported: true
            };
            const expectedText = "/** Testing */\nexport var v!: number = 5;\n";
            doTest("", 0, [structure], expectedText);
        });
    });

    describe(nameof<StatementedNode>(n => n.insertVariableStatement), () => {
        function doTest(startCode: string, index: number, structure: OptionalKindAndTrivia<VariableStatementStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertVariableStatement(index, structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(VariableStatement);
        }

        it("should insert", () => {
            doTest("namespace Identifier2 {\n}\n", 0, { declarations: [{ name: "Identifier1" }] }, "let Identifier1;\n\nnamespace Identifier2 {\n}\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addVariableStatements), () => {
        function doTest(startCode: string, structures: OptionalKindAndTrivia<VariableStatementStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addVariableStatements(structures);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result.length).to.equal(structures.length);
        }

        it("should add multiple", () => {
            doTest("namespace Identifier1 {\n}\n", [{ declarations: [{ name: "Identifier2" }] }, { declarations: [{ name: "Identifier3" }] }],
                "namespace Identifier1 {\n}\n\nlet Identifier2;\nlet Identifier3;\n");
        });
    });

    describe(nameof<StatementedNode>(n => n.addVariableStatement), () => {
        function doTest(startCode: string, structure: OptionalKindAndTrivia<VariableStatementStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addVariableStatement(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
            expect(result).to.be.instanceOf(VariableStatement);
        }

        it("should add one", () => {
            doTest("namespace Identifier1 {\n}\n", { declarations: [{ name: "Identifier2" }] }, "namespace Identifier1 {\n}\n\nlet Identifier2;\n");
        });
    });

    const { sourceFile: variablesSourceFile } = getInfoFromText("var Identifier1;\nvar Identifier2, Identifier3;");
    describe(nameof<StatementedNode>(n => n.getVariableStatements), () => {
        const statements = variablesSourceFile.getVariableStatements();
        it("should have the expected number of statements", () => {
            expect(statements.length).to.equal(2);
        });

        it("should have correct type", () => {
            expect(statements[0]).to.be.instanceOf(VariableStatement);
        });

        it("should not throw when getting from an empty body", () => {
            const { firstChild } = getInfoFromText<StatementedNode & Node>("function test();");
            expect(firstChild.getVariableStatements()).to.deep.equal([]);
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableStatement), () => {
        function doTest(nameOrFindFunction: string | ((declaration: VariableStatement) => boolean), expectedFirstDeclarationName: string | undefined) {
            const statement = variablesSourceFile.getVariableStatement(nameOrFindFunction);
            expect(statement?.getDeclarations()[0].getName()).to.equal(expectedFirstDeclarationName);
        }

        it("should get a variable statement when something matches the provided identifier", () => {
            doTest("Identifier2", "Identifier2");
        });

        it("should get a variable statement by identifier name when there are multiple", () => {
            doTest("Identifier3", "Identifier2");
        });

        it("should return undefined when nothing matches the provided name", () => {
            doTest("DoesNotExist", undefined);
        });

        it("should get a variable statement when something matches the provided function", () => {
            doTest(s => s.getDeclarations().length === 2, "Identifier2");
        });

        it("should return undefined when nothing matches the provided function", () => {
            doTest(s => s.getDeclarations().length === 5, undefined);
        });

        function doContainedTest(text: string, searchName: string, expectedStatement: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const variableStatement = sourceFile.getVariableStatement(searchName);
            expect(variableStatement?.getText()).to.equal(expectedStatement);
        }

        it("should get the statement when doing object destructuring", () => {
            const statement = "const [ a ] = [1];";
            doContainedTest(statement, "a", statement);
        });

        it("should get the statement when doing object destructuring", () => {
            const statement = "const { a } = { a: 1 };";
            doContainedTest(statement, "a", statement);
        });
    });

    describe(nameof<StatementedNode>(n => n.getVariableStatementOrThrow), () => {
        function doTrueTest(nameOrFindFunction: string | ((declaration: VariableStatement) => boolean), expectedFirstDeclarationName: string) {
            const statement = variablesSourceFile.getVariableStatementOrThrow(nameOrFindFunction);
            expect(statement.getDeclarations()[0].getName()).to.equal(expectedFirstDeclarationName);
        }

        it("should get a variable statement by identifier name", () => {
            doTrueTest("Identifier1", "Identifier1");
        });

        it("should get a variable statement by identifier name when there are multiple", () => {
            doTrueTest("Identifier3", "Identifier2");
        });

        it("should throw when nothing matches the provided name", () => {
            expect(() => variablesSourceFile.getVariableStatementOrThrow("DoesNotExist")).to.throw();
        });

        it("should get a variable statement by function when something matches", () => {
            doTrueTest(s => s.getDeclarations().length === 2, "Identifier2");
        });

        it("should throw when nothing matches the provided function", () => {
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

        it("should not throw when getting from an empty body", () => {
            const { firstChild } = getInfoFromText<StatementedNode & Node>("function test();");
            expect(firstChild.getVariableDeclarations()).to.deep.equal([]);
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

        function doTest(text: string, searchName: string, expectedDeclaration: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const variableDec = sourceFile.getVariableDeclaration(searchName);
            expect(variableDec?.getText()).to.equal(expectedDeclaration);
        }

        it("should get when using object destructuring", () => {
            doTest("const { a } = { a: 1 };", "a", "{ a } = { a: 1 }");
        });

        it("should not get the property name for object destructuring", () => {
            doTest("const { a: b } = { a: 1 };", "a", undefined);
        });

        it("should get the binding name for object destructuring", () => {
            doTest("const { a: b } = { a: 1 };", "b", "{ a: b } = { a: 1 }");
        });

        it("should get nested object destructuring", () => {
            doTest("const { a: { b } } = { a: { b: 1 } };", "b", "{ a: { b } } = { a: { b: 1 } }");
        });

        it("should not get the property name for nested object destructuring", () => {
            doTest("const { a: { b: c } } = { a: { b: 1 } };", "b", undefined);
        });

        it("should get the binding name for nested object destructuring", () => {
            doTest("const { a: { b: c } } = { a: { b: 1 } };", "c", "{ a: { b: c } } = { a: { b: 1 } }");
        });

        it("should get when using array destructuring", () => {
            doTest("const [ a ] = [1];", "a", "[ a ] = [1]");
        });

        it("should get when using array destructuring and a rest pattern", () => {
            doTest("const [ a, ...rest ] = [1, 2];", "rest", "[ a, ...rest ] = [1, 2]");
        });

        it("should get when nesting array destructuring", () => {
            doTest("const [[ a ]] = [[1]];", "a", "[[ a ]] = [[1]]");
        });

        it("should get when nesting object in array destructuring", () => {
            doTest("const [{ a }] = [{ a: 1 }];", "a", "[{ a }] = [{ a: 1 }]");
        });

        it("should get when nesting array in object destructuring", () => {
            doTest("const { a: [b] } = { a: [1] };", "b", "{ a: [b] } = { a: [1] }");
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
