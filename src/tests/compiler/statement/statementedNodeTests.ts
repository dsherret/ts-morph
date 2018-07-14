import { expect } from "chai";
import { CaseClause, DefaultClause, FunctionDeclaration, NamespaceDeclaration, Node, SourceFile, StatementedNode, Block } from "../../../compiler";
import { Chars } from "../../../constants";
import { StatementedNodeStructure } from "../../../structures";
import { SyntaxKind } from "../../../typescript";
import { TypeGuards } from "../../../utils";
import { getInfoFromText } from "../testHelpers";

function getInfoFromTextWithSyntax<T extends Node>(text: string, kind?: SyntaxKind) {
    const obj = getInfoFromText(text);
    let firstChild = obj.firstChild as T;
    if (kind != null) {
        firstChild = obj.sourceFile.getFirstDescendantByKindOrThrow(kind) as T;
    }

    return {...obj, firstChild};
}

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(s => s.getStatements), () => {
        it("should get the statements of a source file", () => {
            const {sourceFile} = getInfoFromText("var t; var m;");
            expect(sourceFile.getStatements().map(s => s.getText())).to.deep.equal(["var t;", "var m;"]);
        });

        function doFirstChildTest<T extends Node>(code: string, statements: string[], kind?: SyntaxKind) {
            const {firstChild} = getInfoFromTextWithSyntax<T>(code, kind);
            expect((firstChild as any as StatementedNode).getStatements().map(s => s.getText())).to.deep.equal(statements);
        }

        it("should get the statements of a function", () => {
            doFirstChildTest<FunctionDeclaration>("function i() { var t; var m; }", ["var t;", "var m;"]);
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
    });

    describe(nameof<StatementedNode>(s => s.getStatement), () => {
        it("should get the statement when it exists", () => {
            const {sourceFile} = getInfoFromText("var t; class T {}");
            expect(sourceFile.getStatement(s => TypeGuards.isClassDeclaration(s))!.getText()).to.equal("class T {}");
        });

        it("should return undefined when it doesn't exist", () => {
            const {sourceFile} = getInfoFromText("var t; class T {}");
            expect(sourceFile.getStatement(s => TypeGuards.isInterfaceDeclaration(s))).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(s => s.getStatementOrThrow), () => {
        it("should get the statement when it exists", () => {
            const {sourceFile} = getInfoFromText("var t; class T {}");
            expect(sourceFile.getStatementOrThrow(s => TypeGuards.isClassDeclaration(s)).getText()).to.equal("class T {}");
        });

        it("should throw when it doesn't exist", () => {
            const {sourceFile} = getInfoFromText("var t; class T {}");
            expect(() => sourceFile.getStatementOrThrow(s => TypeGuards.isInterfaceDeclaration(s))).to.throw();
        });
    });

    describe(nameof<StatementedNode>(s => s.getStatementByKind), () => {
        it("should get the statement when it exists", () => {
            const {sourceFile} = getInfoFromText("var t; class T {}");
            expect(sourceFile.getStatementByKind(SyntaxKind.ClassDeclaration)!.getText()).to.equal("class T {}");
        });

        it("should return undefined when it doesn't exist", () => {
            const {sourceFile} = getInfoFromText("var t; class T {}");
            expect(sourceFile.getStatementByKind(SyntaxKind.InterfaceDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(s => s.getStatementByKindOrThrow), () => {
        it("should get the statement when it exists", () => {
            const {sourceFile} = getInfoFromText("var t; class T {}");
            expect(sourceFile.getStatementByKindOrThrow(SyntaxKind.ClassDeclaration).getText()).to.equal("class T {}");
        });

        it("should throw when it doesn't exist", () => {
            const {sourceFile} = getInfoFromText("var t; class T {}");
            expect(() => sourceFile.getStatementByKindOrThrow(SyntaxKind.InterfaceDeclaration)).to.throw();
        });
    });

    describe(nameof<StatementedNode>(s => s.insertStatements), () => {
        function doSourceFileTest(code: string, index: number, statements: string, expectedLength: number, expectedCode: string) {
            const {sourceFile} = getInfoFromText(code);
            const nodes = sourceFile.insertStatements(index, statements);
            expect(nodes.length).to.equal(expectedLength);
            if (nodes.length > 0)
                expect(nodes[0]).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert statements into an empty source file", () => {
            doSourceFileTest("", 0, "newText;\nsecondText;", 2,
                "newText;\nsecondText;\n");
        });

        it("should insert statements after a utf-8 bom", () => {
            doSourceFileTest(Chars.BOM, 0, "newText;", 1, Chars.BOM + "newText;\n");
        });

        it("should allow inserting nothing", () => {
            doSourceFileTest("", 0, "", 0, "");
        });

        it("should allow inserting whitespace", () => {
            doSourceFileTest("", 0, "    ", 0, "    \n");
        });

        it("should throw when specifying an invalid index", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.insertStatements(1, "statements;")).to.throw();
        });

        it("should allow writing", () => {
            const {sourceFile} = getInfoFromText("");
            sourceFile.insertStatements(0, writer => writer.writeLine("statements;"));
            expect(sourceFile.getFullText()).to.equal("statements;\n");
        });

        it("should insert statements at the beginning of a source file", () => {
            doSourceFileTest("function i() {}", 0, "newText;\nsecondText;", 2,
                "newText;\nsecondText;\nfunction i() {}");
        });

        it("should insert statements in the middle of a source file", () => {
            doSourceFileTest("function a() {}\nfunction b() {}", 1, "newText;\nsecondText;", 2,
                "function a() {}\nnewText;\nsecondText;\nfunction b() {}");
        });

        it("should insert statements at the end of a source file", () => {
            doSourceFileTest("function a() {}\nfunction b() {}", 2, "newText;\nsecondText;", 2,
                "function a() {}\nfunction b() {}\nnewText;\nsecondText;");
        });

        function doFirstChildTest<T extends Node>(code: string, index: number, statements: string, expectedLength: number, expectedCode: string, kind?: SyntaxKind) {
            const {sourceFile, firstChild} = getInfoFromTextWithSyntax<T>(code, kind);
            const nodes = (firstChild as any as StatementedNode).insertStatements(index, statements);
            expect(nodes.length).to.equal(expectedLength);
            expect(nodes[0]).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert statements into an empty function", () => {
            doFirstChildTest<FunctionDeclaration>("function i() {\n}\n", 0, "statement;", 1,
                "function i() {\n    statement;\n}\n");
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
            doFirstChildTest<FunctionDeclaration>("function i() { var t;var m; }", 1, "newText;", 1,
                "function i() { var t;\n    newText;var m; }");
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
            const {sourceFile, firstChild} = getInfoFromTextWithSyntax<Block>("function():number{const a = 1, b = true;}", SyntaxKind.Block);
            expect(firstChild.getStatementByKind(SyntaxKind.IfStatement)).equals(undefined);
            firstChild.insertStatements(1, "if(b){return 1;}else {return 2;}");
            expect(firstChild.getStatementByKindOrThrow(SyntaxKind.IfStatement).getText()).equals("if(b){return 1;}else {return 2;}");
        });
    });

    describe(nameof<StatementedNode>(s => s.addStatements), () => {
        function doSourceFileTest(code: string, statements: string, expectedLength: number, expectedCode: string) {
            const {sourceFile} = getInfoFromText(code);
            const nodes = sourceFile.addStatements(statements);
            expect(nodes.length).to.equal(expectedLength);
            expect(nodes[0]).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add statements at the end of a source file", () => {
            doSourceFileTest("function a() {}\nfunction b() {}", "newText;\nsecondText;", 2,
                "function a() {}\nfunction b() {}\nnewText;\nsecondText;");
        });
    });

    describe(nameof<StatementedNode>(s => s.removeStatements), () => {
        function doSourceFileTest(code: string, range: [number, number], expectedCode: string) {
            const {sourceFile} = getInfoFromText(code);
            sourceFile.removeStatements(range);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should throw when specifying an invalid range", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.removeStatements([5, 7])).to.throw();
        });

        it("should remove statements at the beginning of a source file", () => {
            doSourceFileTest("function a() {}\nfunction b() {}\nfunction c() {}\n", [0, 1], "function c() {}\n");
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
            const {sourceFile, firstChild} = getInfoFromTextWithSyntax<T>(code, kind);
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
            const {sourceFile, firstChild} = getInfoFromTextWithSyntax<Block>("function():number{const a = 1, b = true;}", SyntaxKind.Block);
            expect(firstChild.getStatementByKind(SyntaxKind.VariableStatement)).to.not.be.undefined;
            firstChild.removeStatement(0);
            expect(firstChild.getStatementByKind(SyntaxKind.VariableStatement)).to.be.undefined;
        });
    });

    describe(nameof<StatementedNode>(s => s.removeStatement), () => {
        function doSourceFileTest(code: string, index: number, expectedCode: string) {
            const {sourceFile} = getInfoFromText(code);
            sourceFile.removeStatement(index);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should throw when specifying an invalid index", () => {
            const {sourceFile} = getInfoFromText("class myClass {}");
            expect(() => sourceFile.removeStatement(1)).to.throw();
        });

        it("should remove at the specified index", () => {
            doSourceFileTest("function a() {}\nfunction b() {}\nfunction c() {}\n", 1, "function a() {}\n\nfunction c() {}\n");
        });
    });

    describe(nameof<SourceFile>(s => s.fill), () => {
        function doTest(startingCode: string, structure: StatementedNodeStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startingCode);
            sourceFile.fill(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("", {}, "");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<StatementedNodeStructure> = {
                classes: [{ name: "Identifier1" }],
                enums: [{ name: "Identifier2" }],
                functions: [{ name: "Identifier3" }],
                interfaces: [{ name: "Identifier4" }],
                namespaces: [{ name: "Identifier5" }],
                typeAliases: [{ name: "Identifier6", type: "string" }]
            };
            doTest("", structure,
                "class Identifier1 {\n}\n\nenum Identifier2 {\n}\n\nfunction Identifier3() {\n}\n\ninterface Identifier4 {\n}\n\nnamespace Identifier5 {\n}\n\n" +
                "type Identifier6 = string;\n");
        });
    });
});
