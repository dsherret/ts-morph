import {expect} from "chai";
import {StatementedNode, SourceFile, FunctionDeclaration, NamespaceDeclaration, Node} from "./../../../compiler";
import {StatementedNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(StatementedNode), () => {
    describe(nameof<StatementedNode>(s => s.getStatements), () => {
        it("should get the statements of a source file", () => {
            const {sourceFile} = getInfoFromText("var t; var m;");
            expect(sourceFile.getStatements().map(s => s.getText())).to.deep.equal(["var t;", "var m;"]);
        });

        function doFirstChildTest<T extends Node>(code: string, statements: string[]) {
            const {firstChild} = getInfoFromText<T>(code);
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

        function doFirstChildTest<T extends Node>(code: string, index: number, statements: string, expectedLength: number, expectedCode: string) {
            const {sourceFile, firstChild} = getInfoFromText<T>(code);
            const nodes = (firstChild as any as StatementedNode).insertStatements(index, statements);
            expect(nodes.length).to.equal(expectedLength);
            expect(nodes[0]).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

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
    });

    describe(nameof<StatementedNode>(s => s.removeStatement), () => {
        function doSourceFileTest(code: string, index: number, expectedCode: string) {
            const {sourceFile} = getInfoFromText(code);
            sourceFile.removeStatement(index);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should throw when specifying an invalid index", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.removeStatement(5)).to.throw();
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
