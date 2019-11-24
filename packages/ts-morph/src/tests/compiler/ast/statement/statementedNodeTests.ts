import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { CaseClause, DefaultClause, FunctionDeclaration, NamespaceDeclaration, Node, SourceFile, StatementedNode, Block, BodyableNode,
    ClassDeclaration } from "../../../../compiler";
import { StatementedNodeStructure, StatementStructures, StructureKind } from "../../../../structures";
import { getInfoFromText, fillStructures } from "../../testHelpers";
import { WriterFunction } from "../../../../types";

function getInfoFromTextWithSyntax<T extends Node>(text: string, kind?: SyntaxKind) {
    const obj = getInfoFromText(text);
    let firstChild = obj.firstChild as T;
    if (kind != null)
        firstChild = obj.sourceFile.getFirstDescendantByKindOrThrow(kind) as T;

    return { ...obj, firstChild };
}

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(s => s.getStatements), () => {
        it("should get the statements of a source file", () => {
            const { sourceFile } = getInfoFromText("var t; var m;");
            expect(sourceFile.getStatements().map(s => s.getText())).to.deep.equal(["var t;", "var m;"]);
        });

        function doFirstChildTest<T extends Node>(code: string, statements: string[], kind?: SyntaxKind) {
            const { firstChild } = getInfoFromTextWithSyntax<T>(code, kind);
            expect((firstChild as any as StatementedNode).getStatements().map(s => s.getText())).to.deep.equal(statements);
        }

        it("should get the statements of a function", () => {
            doFirstChildTest<FunctionDeclaration>("function i() { var t; var m; }", ["var t;", "var m;"]);
        });

        it("should get the statements of a function with no body", () => {
            doFirstChildTest<FunctionDeclaration>("function i();", []);
        });

        it("should get the statements of a namespace", () => {
            doFirstChildTest<NamespaceDeclaration>("namespace n { var t; var m; }", ["var t;", "var m;"]);
        });

        it("should get the statements of a namespace that uses dot notation", () => {
            doFirstChildTest<NamespaceDeclaration>("namespace n.inner { var t; var m; }", ["var t;", "var m;"]);
        });

        it("should get statements of a case clause", () => {
            doFirstChildTest<CaseClause>("switch (x) { case 1: x = 0; break; }", ["x = 0;", "break;"], SyntaxKind.CaseClause);
        });

        it("should get statements of a default clause", () => {
            doFirstChildTest<DefaultClause>("switch (x) { default: x = 0; break; }", ["x = 0;", "break;"], SyntaxKind.DefaultClause);
        });

        it("should get the statements of a block", () => {
            doFirstChildTest("function v() {\nvar t; var m;\n}", ["var t;", "var m;"], SyntaxKind.Block);
        });

        it("should get the statements of a module block", () => {
            doFirstChildTest("namespace v {\nvar t; var m;\n}", ["var t;", "var m;"], SyntaxKind.ModuleBlock);
        });
    });

    describe(nameof<StatementedNode>(s => s.getStatement), () => {
        it("should get the statement when it exists", () => {
            const { sourceFile } = getInfoFromText("var t; class T {}");
            const statement = sourceFile.getStatement(Node.isClassDeclaration);
            assert<IsExact<typeof statement, ClassDeclaration | undefined>>(true);
            expect(statement!.getText()).to.equal("class T {}");
        });

        it("should return undefined when it doesn't exist", () => {
            const { sourceFile } = getInfoFromText("var t; class T {}");
            expect(sourceFile.getStatement(s => Node.isInterfaceDeclaration(s))).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(s => s.getStatementOrThrow), () => {
        it("should get the statement when it exists", () => {
            const { sourceFile } = getInfoFromText("var t; class T {}");
            const statement = sourceFile.getStatementOrThrow(Node.isClassDeclaration);
            assert<IsExact<typeof statement, ClassDeclaration>>(true);
            expect(statement.getText()).to.equal("class T {}");
        });

        it("should throw when it doesn't exist", () => {
            const { sourceFile } = getInfoFromText("var t; class T {}");
            expect(() => sourceFile.getStatementOrThrow(s => Node.isInterfaceDeclaration(s))).to.throw();
        });
    });

    describe(nameof<StatementedNode>(s => s.getStatementByKind), () => {
        function doTest(text: string, kind: SyntaxKind, expectedNodeText: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const node = sourceFile.getStatementByKind(kind);
            expect(node?.getText()).to.equal(expectedNodeText);
        }

        it("should get the statement when it exists", () => {
            doTest("var t; class T {}", SyntaxKind.ClassDeclaration, "class T {}");
        });

        it("should get single line comment trivia", () => {
            doTest("// test", SyntaxKind.SingleLineCommentTrivia, "// test");
        });

        it("should get multi-line comment trivia", () => {
            doTest("/*a*/", SyntaxKind.MultiLineCommentTrivia, "/*a*/");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest("var t; class T {}", SyntaxKind.InterfaceDeclaration, undefined);
        });
    });

    describe(nameof<StatementedNode>(s => s.getStatementByKindOrThrow), () => {
        function doTest(text: string, kind: SyntaxKind, expectedNodeText: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const func = () => sourceFile.getStatementByKindOrThrow(kind);
            if (expectedNodeText == null)
                expect(func).to.throw();
            else
                expect(func()!.getText()).to.equal(expectedNodeText);
        }

        it("should get the statement when it exists", () => {
            doTest("var t; class T {}", SyntaxKind.ClassDeclaration, "class T {}");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest("var t; class T {}", SyntaxKind.InterfaceDeclaration, undefined);
        });
    });

    describe(nameof<StatementedNode>(s => s.insertStatements), () => {
        function doSourceFileTest(
            code: string,
            index: number,
            statements: string | WriterFunction | StatementStructures[],
            expectedLength: number,
            expectedCode: string
        ) {
            const { sourceFile } = getInfoFromText(code);
            const nodes = sourceFile.insertStatements(index, statements);
            expect(nodes.length).to.equal(expectedLength);
            if (nodes.length > 0)
                expect(nodes[0]).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert statements into an empty source file", () => {
            doSourceFileTest(
                "",
                0,
                "newText;\nsecondText;",
                2,
                "newText;\nsecondText;\n"
            );
        });

        it("should insert statements after a utf-8 bom", () => {
            doSourceFileTest("\uFEFF", 0, "newText;", 1, "newText;\n");
        });

        it("should allow inserting nothing", () => {
            doSourceFileTest("", 0, "", 0, "");
        });

        it("should allow inserting whitespace", () => {
            doSourceFileTest("", 0, "    ", 0, "    \n");
        });

        it("should throw when specifying an invalid index", () => {
            const { sourceFile } = getInfoFromText("");
            expect(() => sourceFile.insertStatements(1, "statements;")).to.throw();
        });

        it("should allow writing", () => {
            const { sourceFile } = getInfoFromText("");
            sourceFile.insertStatements(0, writer => writer.writeLine("statements;"));
            expect(sourceFile.getFullText()).to.equal("statements;\n");
        });

        it("should support passing an array of strings or writer functions and write with newlines", () => {
            const { sourceFile } = getInfoFromText("");
            sourceFile.insertStatements(0, [
                writer => writer.writeLine("statements;"),
                "// other",
                writer => writer.writeLine("test;")
            ]);
            expect(sourceFile.getFullText()).to.equal("statements;\n// other\ntest;\n");
        });

        it("should insert statements at the beginning of a source file", () => {
            doSourceFileTest(
                "function i() {}",
                0,
                "newText;\nsecondText;",
                2,
                "newText;\nsecondText;\nfunction i() {}"
            );
        });

        it("should insert statements in the middle of a source file", () => {
            doSourceFileTest(
                "function a() {}\nfunction b() {}",
                1,
                "newText;\nsecondText;",
                2,
                "function a() {}\nnewText;\nsecondText;\nfunction b() {}"
            );
        });

        it("should insert statements at the end of a source file", () => {
            doSourceFileTest(
                "function a() {}\nfunction b() {}",
                2,
                "newText;\nsecondText;",
                2,
                "function a() {}\nfunction b() {}\nnewText;\nsecondText;"
            );
        });

        it("should insert structures", () => {
            doSourceFileTest(
                "",
                0,
                [{ kind: StructureKind.Function, name: "f" }],
                1,
                "function f() {\n}\n"
            );
        });

        function doFirstChildTest<T extends Node>(
            code: string,
            index: number,
            statements: string,
            expectedLength: number,
            expectedCode: string,
            kind?: SyntaxKind
        ) {
            const { sourceFile, firstChild } = getInfoFromTextWithSyntax<T>(code, kind);
            const nodes = (firstChild as any as StatementedNode).insertStatements(index, statements);
            expect(nodes.length).to.equal(expectedLength);
            expect(nodes[0]).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert statements into a function with no body", () => {
            doFirstChildTest<FunctionDeclaration>(
                "function i();\n",
                0,
                "statement;",
                1,
                "function i() {\n    statement;\n}\n"
            );
        });

        it("should insert statements into an empty function", () => {
            doFirstChildTest<FunctionDeclaration>(
                "function i() {\n}\n",
                0,
                "statement;",
                1,
                "function i() {\n    statement;\n}\n"
            );
        });

        it("should insert statements at the beginning and into a function", () => {
            doFirstChildTest<FunctionDeclaration>("function i() {\n    var t;\n    var m;\n}", 0, "newText;\nsecondText;", 2,
                "function i() {\n    newText;\n    secondText;\n    var t;\n    var m;\n}");
        });

        it("should insert statements in the middle and into a namespace", () => {
            doFirstChildTest<NamespaceDeclaration>("namespace n {\n    var t;\n    var m;\n}", 1, "newText;\nsecondText;", 2,
                "namespace n {\n    var t;\n    newText;\n    secondText;\n    var m;\n}");
        });

        it("should insert statements at the end and into a namespace", () => {
            doFirstChildTest<NamespaceDeclaration>("namespace n {\n    var t;\n    var m;\n}", 2, "newText;\nsecondText;", 2,
                "namespace n {\n    var t;\n    var m;\n    newText;\n    secondText;\n}");
        });

        it("should insert between statements right beside each other", () => {
            doFirstChildTest<FunctionDeclaration>(
                "function i() { var t;var m; }",
                1,
                "newText;",
                1,
                "function i() { var t;\n    newText;var m; }"
            );
        });

        const caseClause = "switch (x) {\n    case 1:\n        x = 0;\n        break;\n}";
        it("should insert statements at the beginning and into a case clase", () => {
            doFirstChildTest<CaseClause>(caseClause, 0, "newText;\nsecondText;", 2,
                "switch (x) {\n    case 1:\n        newText;\n        secondText;\n        x = 0;\n        break;\n}", SyntaxKind.CaseClause);
        });

        it("should insert statements in the middle and into a case clause", () => {
            doFirstChildTest<CaseClause>(caseClause, 1, "newText;\nsecondText;", 2,
                "switch (x) {\n    case 1:\n        x = 0;\n        newText;\n        secondText;\n        break;\n}", SyntaxKind.CaseClause);
        });

        it("should insert statements at the end and into a case clause", () => {
            doFirstChildTest<CaseClause>(caseClause, 2, "newText;\nsecondText;", 2,
                "switch (x) {\n    case 1:\n        x = 0;\n        break;\n        newText;\n        secondText;\n}", SyntaxKind.CaseClause);
        });

        it("should insert into a case clause with a block", () => {
            doFirstChildTest<CaseClause>("switch (x) {\n    case 1: {\n    }\n\n}", 0, "newText;", 1,
                "switch (x) {\n    case 1: {\n        newText;\n    }\n\n}", SyntaxKind.CaseClause);
        });

        const defaultClause = "switch (x) {\n    default:\n        x = 0;\n        break;\n}";
        it("should insert statements at the beginning and into a default clause", () => {
            doFirstChildTest<DefaultClause>(defaultClause, 0, "newText;\nsecondText;", 2,
                "switch (x) {\n    default:\n        newText;\n        secondText;\n        x = 0;\n        break;\n}", SyntaxKind.DefaultClause);
        });

        it("should insert statements in the middle and into a default clause", () => {
            doFirstChildTest<DefaultClause>(defaultClause, 1, "newText;\nsecondText;", 2,
                "switch (x) {\n    default:\n        x = 0;\n        newText;\n        secondText;\n        break;\n}", SyntaxKind.DefaultClause);
        });

        it("should insert statements at the end and into a default clause", () => {
            doFirstChildTest<DefaultClause>(defaultClause, 2, "newText;\nsecondText;", 2,
                "switch (x) {\n    default:\n        x = 0;\n        break;\n        newText;\n        secondText;\n}", SyntaxKind.DefaultClause);
        });

        it("should insert into a default clause with a block", () => {
            doFirstChildTest<CaseClause>("switch (x) {\n    default: {\n    }\n\n}", 0, "newText;", 1,
                "switch (x) {\n    default: {\n        newText;\n    }\n\n}", SyntaxKind.DefaultClause);
        });

        it("should insert statements in a Block", () => {
            const { firstChild } = getInfoFromTextWithSyntax<Block>("function():number{const a = 1, b = true;}", SyntaxKind.Block);
            expect(firstChild.getStatementByKind(SyntaxKind.IfStatement)).equals(undefined);
            firstChild.insertStatements(1, "if(b){return 1;}else {return 2;}");
            expect(firstChild.getStatementByKindOrThrow(SyntaxKind.IfStatement).getText()).equals("if(b){return 1;}else {return 2;}");
        });

        it("should insert comments into a function", () => {
            doFirstChildTest<FunctionDeclaration>(
                "function f() {\n}",
                0,
                "// comment",
                1,
                "function f() {\n    // comment\n}"
            );
        });
    });

    describe(nameof<StatementedNode>(s => s.addStatements), () => {
        function doSourceFileTest(code: string, statements: string, expectedLength: number, expectedCode: string) {
            const { sourceFile } = getInfoFromText(code);
            const nodes = sourceFile.addStatements(statements);
            expect(nodes.length).to.equal(expectedLength);
            expect(nodes[0]).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add statements at the end of a source file", () => {
            doSourceFileTest(
                "function a() {}\nfunction b() {}",
                "newText;\nsecondText;",
                2,
                "function a() {}\nfunction b() {}\nnewText;\nsecondText;"
            );
        });
    });

    describe(nameof<StatementedNode>(s => s.removeStatements), () => {
        function doSourceFileTest(code: string, range: [number, number], expectedCode: string) {
            const { sourceFile } = getInfoFromText(code);
            sourceFile.removeStatements(range);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should throw when specifying an invalid range", () => {
            const { sourceFile } = getInfoFromText("");
            expect(() => sourceFile.removeStatements([5, 7])).to.throw();
        });

        it("should remove statements at the beginning of a source file", () => {
            doSourceFileTest("function a() {}\nfunction b() {}\nfunction c() {}\n", [0, 1], "function c() {}\n");
        });

        it("should remove when there are comment statements", () => {
            doSourceFileTest("/// <reference path='test.ts' />\n//test", [0, 1], "");
        });

        it("should remove statements in the middle of a source file", () => {
            doSourceFileTest("function a() {}\nfunction b() {}\nfunction c() {}\n", [1, 1], "function a() {}\n\nfunction c() {}\n");
        });

        it("should remove statements at the end source file", () => {
            doSourceFileTest("function a() {}\nfunction b() {}\nfunction c() {}\n", [1, 2], "function a() {}\n");
        });

        it("should remove an if statement", () => {
            doSourceFileTest("if (true) {\n    console.log(6);\n}\n", [0, 0], "");
        });

        function doFirstChildTest<T extends Node>(code: string, range: [number, number], expectedCode: string, kind?: SyntaxKind) {
            const { sourceFile, firstChild } = getInfoFromTextWithSyntax<T>(code, kind);
            const nodes = (firstChild as any as StatementedNode).removeStatements(range);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        const caseClause = "switch (x) {\n    case 1:\n        x = 0;\n        y = 1;\n        break;\n}";
        it("should remove statements at the beginning of a case clause", () => {
            doFirstChildTest<CaseClause>(caseClause, [0, 1], "switch (x) {\n    case 1:\n        break;\n}", SyntaxKind.CaseClause);
        });

        it("should remove statements in the middle of a case clause", () => {
            doFirstChildTest<CaseClause>(caseClause, [1, 1], "switch (x) {\n    case 1:\n        x = 0;\n        break;\n}", SyntaxKind.CaseClause);
        });

        it("should remove statements at the end case clause", () => {
            doFirstChildTest<CaseClause>(caseClause, [1, 2], "switch (x) {\n    case 1:\n        x = 0;\n}", SyntaxKind.CaseClause);
        });

        const defaultClause = "switch (x) {\n    default:\n        x = 0;\n        y = 1;\n        break;\n}";
        it("should remove statements at the beginning of a default clause", () => {
            doFirstChildTest<DefaultClause>(defaultClause, [0, 1], "switch (x) {\n    default:\n        break;\n}", SyntaxKind.DefaultClause);
        });

        it("should remove statements in the middle of a default clause", () => {
            doFirstChildTest<DefaultClause>(defaultClause, [1, 1], "switch (x) {\n    default:\n        x = 0;\n        break;\n}", SyntaxKind.DefaultClause);
        });

        it("should remove statements at the end default clause", () => {
            doFirstChildTest<DefaultClause>(defaultClause, [1, 2], "switch (x) {\n    default:\n        x = 0;\n}", SyntaxKind.DefaultClause);
        });

        it("should remove statements in a Block", () => {
            const { firstChild } = getInfoFromTextWithSyntax<Block>("function():number{const a = 1, b = true;}", SyntaxKind.Block);
            expect(firstChild.getStatementByKind(SyntaxKind.VariableStatement)).to.not.be.undefined;
            firstChild.removeStatement(0);
            expect(firstChild.getStatementByKind(SyntaxKind.VariableStatement)).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(s => s.removeStatement), () => {
        function doSourceFileTest(code: string, index: number, expectedCode: string) {
            const { sourceFile } = getInfoFromText(code);
            sourceFile.removeStatement(index);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should throw when specifying an invalid index", () => {
            const { sourceFile } = getInfoFromText("class myClass {}");
            expect(() => sourceFile.removeStatement(1)).to.throw();
        });

        it("should remove at the specified index", () => {
            doSourceFileTest("function a() {}\nfunction b() {}\nfunction c() {}\n", 1, "function a() {}\n\nfunction c() {}\n");
        });
    });

    describe(nameof<FunctionDeclaration>(n => n.getStructure), () => {
        describe(nameof(BodyableNode), () => {
            function doBodyableTest(startCode: string, statements: StatementStructures[] | undefined) {
                const { firstChild } = getInfoFromText<FunctionDeclaration>(startCode);
                const structure = firstChild.getStructure() as StatementedNodeStructure;

                if (statements == null)
                    expect(structure.hasOwnProperty(nameof<StatementedNodeStructure>(s => s.statements))).to.be.true;

                expect(structure.statements).to.deep.equal(statements);
            }

            it("should get the body text when there is none", () => {
                doBodyableTest("function test();", undefined);
            });

            it("should get the body text when there is a lot of whitespace", () => {
                doBodyableTest("function test() {\n   \t\n\r\n   \t}", []);
            });

            it("should get the body text without indentation", () => {
                doBodyableTest("function test() {\n    export class Test {\n        prop: string;\n    }\n}\n}", [fillStructures.classDeclaration({
                    name: "Test",
                    isExported: true,
                    properties: [fillStructures.property({
                        name: "prop",
                        type: "string"
                    })]
                })]);
            });
        });
    });

    describe(nameof<SourceFile>(s => s.set), () => {
        function doTest(startingCode: string, structure: StatementedNodeStructure, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startingCode);
            sourceFile.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should do nothing when undefined for a non-bodyable node (source file)", () => {
            const code = "function myFunction() {\n}";
            doTest(code, { statements: undefined }, code);
        });

        it("should remove the statements when empty", () => {
            const code = "function myFunction() {\n}";
            doTest(code, { statements: [] }, "");
        });

        it("should set statements specified", () => {
            const code = "function myFunction() {\n}";
            doTest(code, {
                statements: [
                    "var myVar;",
                    writer => writer.writeLine("console.log;"),
                    {
                        kind: StructureKind.Class,
                        name: "MyClass"
                    }
                ]
            }, `var myVar;\nconsole.log;\n\nclass MyClass {\n}\n`);
        });

        it("should support providing just a string", () => {
            doTest("", { statements: "1;" }, "1;\n");
        });

        it("should support providing just a writer function", () => {
            doTest("", { statements: writer => writer.write("1;") }, "1;\n");
        });

        describe(nameof(BodyableNode), () => {
            function doBodyableTest(startingCode: string, structure: StatementedNodeStructure, expectedCode: string) {
                const { sourceFile, firstChild } = getInfoFromText<FunctionDeclaration>(startingCode);
                firstChild.set(structure);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should set the text of a function when using a string", () => {
                doBodyableTest("function myFunction() {\n}", { statements: ["var myVar;"] }, "function myFunction() {\n    var myVar;\n}");
            });

            it("should set the text of a function when using a writer", () => {
                doBodyableTest(
                    "function myFunction() {\n}",
                    { statements: [writer => writer.writeLine("var myVar;")] },
                    "function myFunction() {\n    var myVar;\n}"
                );
            });

            it("should remove the body when it's undefined", () => {
                doBodyableTest("function myFunction() {\n}", { statements: undefined }, "function myFunction();");
            });

            it("should not remove the body when the property doesn't exist", () => {
                doBodyableTest("function myFunction() {\n}", {}, "function myFunction() {\n}");
            });
        });
    });
});
