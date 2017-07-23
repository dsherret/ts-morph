import {expect} from "chai";
import * as ts from "typescript";
import {DocumentationableNode, VariableStatement, FunctionDeclaration, Node, ClassDeclaration} from "./../../../compiler";
import {JSDocStructure, DocumentationableNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(DocumentationableNode), () => {
    describe(nameof(VariableStatement), () => {
        const {sourceFile} = getInfoFromText("/** Text */\nvar docedComment;\n/** First */\n/** Second */var multiCommented;\nvar nonDocedComment;");
        const statements = sourceFile.getVariableStatements();
        const docedStatement = statements[0];
        const multiDocedStatement = statements[1];
        const nonDocedStatement = statements[2];

        describe(nameof<DocumentationableNode>(n => n.getDocumentationComment), () => {
            describe("documentationed node", () => {
                it("should get the comment", () => {
                    expect(docedStatement.getDocumentationComment()).to.equal("Text");
                });
            });

            describe("multi-documentationed node", () => {
                it("should get the comment separated by newlines", () => {
                    expect(multiDocedStatement.getDocumentationComment()).to.equal("First\nSecond");
                });
            });

            describe("not documentationed node", () => {
                it("should return undefined", () => {
                    expect(nonDocedStatement.getDocumentationComment()).to.be.undefined;
                });
            });
        });

        describe(nameof<DocumentationableNode>(n => n.getDocumentationCommentNodes), () => {
            describe("documentationed node", () => {
                const nodes = docedStatement.getDocumentationCommentNodes();
                it("should have the right number of nodes", () => {
                    expect(nodes.length).to.equal(1);
                });

                it("should have the right node", () => {
                    expect(nodes[0].getText()).to.equal("/** Text */");
                });

                it("should have the right node kind", () => {
                    expect(nodes[0].getKind()).to.equal(ts.SyntaxKind.JSDocComment);
                });
            });

            describe("multi documentationed node", () => {
                it("should have the right number of nodes", () => {
                    expect(multiDocedStatement.getDocumentationCommentNodes().length).to.equal(2);
                });
            });

            describe("not documentationed node", () => {
                it("should not have any doc comment nodes", () => {
                    expect(nonDocedStatement.getDocumentationCommentNodes().length).to.equal(0);
                });
            });
        });
    });

    describe(nameof(FunctionDeclaration), () => {
        const {firstChild} = getInfoFromText<FunctionDeclaration>("/**\n * Test.\n * @name - Test\n */\nfunction myFunction(name: string) {}");
        const doc = firstChild.getDocumentationCommentNodes()[0];

        it("should have the right node kind", () => {
            expect(doc.getKind()).to.equal(ts.SyntaxKind.JSDocComment);
        });
    });

    describe(nameof<DocumentationableNode>(n => n.insertDocs), () => {
        function doTest(startCode: string, insertIndex: number, structures: JSDocStructure[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertDocs(insertIndex, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert when none exist", () => {
            doTest("function identifier() {}", 0, [{ description: "Description" }], "/**\n * Description\n */\nfunction identifier() {}");
        });

        it("should insert at start when indentation is different", () => {
            doTest("  /**\n   * Desc2\n   */\n  function identifier() {}", 0, [{ description: "Desc1" }],
                "  /**\n   * Desc1\n   */\n  /**\n   * Desc2\n   */\n  function identifier() {}");
        });

        it("should insert multiple at end", () => {
            doTest("/**\n * Desc1\n */\nfunction identifier() {}", 1, [{ description: "Desc2" }, { description: "Desc3" }],
                "/**\n * Desc1\n */\n/**\n * Desc2\n */\n/**\n * Desc3\n */\nfunction identifier() {}");
        });

        it("should insert in the middle", () => {
            doTest("/**\n * Desc1\n */\n/**\n * Desc3\n */\nfunction identifier() {}", 1, [{ description: "Desc2" }],
                "/**\n * Desc1\n */\n/**\n * Desc2\n */\n/**\n * Desc3\n */\nfunction identifier() {}");
        });

        it("should do nothing if empty array", () => {
            doTest("function identifier() {}", 0, [], "function identifier() {}");
        });
    });

    describe(nameof<DocumentationableNode>(n => n.insertDoc), () => {
        function doTest(startCode: string, index: number, structure: JSDocStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertDoc(index, structure);
            expect(result).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert", () => {
            doTest("/**\n * Desc2\n */\nfunction identifier() {}", 0, { description: "Desc1" },
                "/**\n * Desc1\n */\n/**\n * Desc2\n */\nfunction identifier() {}");
        });
    });

    describe(nameof<DocumentationableNode>(n => n.addDocs), () => {
        function doTest(startCode: string, structures: JSDocStructure[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addDocs(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add multiple at end", () => {
            doTest("/**\n * Desc1\n */\nfunction identifier() {}", [{ description: "Desc2" }, { description: "Desc3" }],
                "/**\n * Desc1\n */\n/**\n * Desc2\n */\n/**\n * Desc3\n */\nfunction identifier() {}");
        });
    });

    describe(nameof<DocumentationableNode>(n => n.addDoc), () => {
        function doTest(startCode: string, structure: JSDocStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addDoc(structure);
            expect(result).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add at the end", () => {
            doTest("/**\n * Desc1\n */\nfunction identifier() {}", { description: "Desc2" },
                "/**\n * Desc1\n */\n/**\n * Desc2\n */\nfunction identifier() {}");
        });
    });

    describe(nameof<ClassDeclaration>(n => n.fill), () => {
        function doTest(startingCode: string, structure: DocumentationableNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should modify when setting", () => {
            doTest("class Identifier {}", { docs: [{ description: "Desc1" }, { description: "Desc2" }] }, "/**\n * Desc1\n */\n/**\n * Desc2\n */\nclass Identifier {}");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("class Identifier {}", {}, "class Identifier {}");
        });
    });
});
