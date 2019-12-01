import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, FunctionDeclaration, JSDocableNode, Node, VariableStatement } from "../../../../compiler";
import { WriterFunction } from "../../../../types";
import { JSDocableNodeStructure, JSDocStructure, OptionalKind } from "../../../../structures";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(JSDocableNode), () => {
    describe(nameof(VariableStatement), () => {
        const { sourceFile } = getInfoFromText("/** Text */\nvar docedComment;\n/** First */\n/** Second */var multiCommented;\nvar nonDocedComment;");
        const statements = sourceFile.getVariableStatements();
        const docedStatement = statements[0];
        const multiDocedStatement = statements[1];
        const nonDocedStatement = statements[2];

        describe(nameof<JSDocableNode>(n => n.getJsDocs), () => {
            describe("documentationed node", () => {
                const nodes = docedStatement.getJsDocs();
                it("should have the right number of nodes", () => {
                    expect(nodes.length).to.equal(1);
                });

                it("should have the right node", () => {
                    expect(nodes[0].getText()).to.equal("/** Text */");
                });

                it("should have the right node kind", () => {
                    expect(nodes[0].getKind()).to.equal(SyntaxKind.JSDocComment);
                });
            });

            describe("multi documentationed node", () => {
                it("should have the right number of nodes", () => {
                    expect(multiDocedStatement.getJsDocs().length).to.equal(2);
                });
            });

            describe("not documentationed node", () => {
                it("should not have any doc comment nodes", () => {
                    expect(nonDocedStatement.getJsDocs().length).to.equal(0);
                });
            });
        });
    });

    describe(nameof(FunctionDeclaration), () => {
        const { firstChild } = getInfoFromText<FunctionDeclaration>("/**\n * Test.\n * @name - Test\n */\nfunction myFunction(name: string) {}");
        const doc = firstChild.getJsDocs()[0];

        it("should have the right node kind", () => {
            expect(doc.getKind()).to.equal(SyntaxKind.JSDocComment);
        });
    });

    describe(nameof<JSDocableNode>(n => n.insertJsDocs), () => {
        function doTest(
            startCode: string,
            insertIndex: number,
            structures: (OptionalKind<JSDocStructure> | string | WriterFunction)[],
            expectedCode: string,
            syntaxKind = SyntaxKind.FunctionDeclaration
        ) {
            const { descendant, sourceFile } = getInfoFromTextWithDescendant(startCode, syntaxKind);
            const result = (descendant as any as JSDocableNode).insertJsDocs(insertIndex, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert when none exist as single line", () => {
            doTest("function identifier() {}", 0, [{ description: "Description" }], "/** Description */\nfunction identifier() {}");
        });

        it("should insert when none exist as multi-line line when adding a newline at the start", () => {
            doTest("function identifier() {}", 0, [{ description: "\nDescription" }], "/**\n * Description\n */\nfunction identifier() {}");
        });

        it("should insert when none exist as multi-line line when adding a \\r\\n newline at the start", () => {
            doTest("function identifier() {}", 0, [{ description: "\r\nDescription" }], "/**\n * Description\n */\nfunction identifier() {}");
        });

        it("should insert when none exist as multi-line line when multiple lines", () => {
            doTest(
                "function identifier() {}",
                0,
                [{ description: "Description\nOther" }],
                "/**\n * Description\n * Other\n */\nfunction identifier() {}"
            );
        });

        it("should insert at start when indentation is different", () => {
            doTest("namespace N {\n    /**\n     * Desc2\n     */\n    function identifier() {}\n}", 0, [{ description: "\nDesc1" }],
                "namespace N {\n    /**\n     * Desc1\n     */\n    /**\n     * Desc2\n     */\n    function identifier() {}\n}");
        });

        it("should insert multiple at end", () => {
            doTest("/**\n * Desc1\n */\nfunction identifier() {}", 1, [{ description: writer => writer.newLine().write("Desc2") }, "Desc3"],
                "/**\n * Desc1\n */\n/**\n * Desc2\n */\n/** Desc3 */\nfunction identifier() {}");
        });

        it("should insert in the middle", () => {
            doTest("/**\n * Desc1\n */\n/**\n * Desc3\n */\nfunction identifier() {}", 1, [writer => writer.write("\nDesc2")],
                "/**\n * Desc1\n */\n/**\n * Desc2\n */\n/**\n * Desc3\n */\nfunction identifier() {}");
        });

        it("should do nothing if empty array", () => {
            doTest("function identifier() {}", 0, [], "function identifier() {}");
        });

        it("should not have trailing whitespace when a line is blank", () => {
            doTest("function identifier() {}", 0, [{ description: "t\n\nu" }], "/**\n * t\n *\n * u\n */\nfunction identifier() {}");
        });

        describe("PropertyDeclaration", () => {
            it("should add a js doc to a property declaration", () => {
                doTest("class C {\n    prop;\n}", 0, [{ description: "\nTesting" }], "class C {\n    /**\n     * Testing\n     */\n    prop;\n}",
                    SyntaxKind.PropertyDeclaration);
            });
        });
    });

    describe(nameof<JSDocableNode>(n => n.insertJsDoc), () => {
        function doTest(startCode: string, index: number, structure: OptionalKind<JSDocStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.insertJsDoc(index, structure);
            expect(result).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert", () => {
            doTest(
                "/**\n * Desc2\n */\nfunction identifier() {}",
                0,
                { description: "Desc1" },
                "/** Desc1 */\n/**\n * Desc2\n */\nfunction identifier() {}"
            );
        });
    });

    describe(nameof<JSDocableNode>(n => n.addJsDocs), () => {
        function doTest(startCode: string, structures: (OptionalKind<JSDocStructure> | string)[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addJsDocs(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add multiple at end", () => {
            doTest("/**\n * Desc1\n */\nfunction identifier() {}", [{ description: "Desc2" }, "\nDesc3"],
                "/**\n * Desc1\n */\n/** Desc2 */\n/**\n * Desc3\n */\nfunction identifier() {}");
        });
    });

    describe(nameof<JSDocableNode>(n => n.addJsDoc), () => {
        function doTest(startCode: string, structure: OptionalKind<JSDocStructure>, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
            const result = firstChild.addJsDoc(structure);
            expect(result).to.be.instanceOf(Node);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add at the end", () => {
            doTest("/**\n * Desc1\n */\nfunction identifier() {}", { description: "\nDesc2" },
                "/**\n * Desc1\n */\n/**\n * Desc2\n */\nfunction identifier() {}");
        });
    });

    describe(nameof<ClassDeclaration>(n => n.set), () => {
        function doTest(startingCode: string, structure: JSDocableNodeStructure, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startingCode);
            firstChild.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should modify when setting", () => {
            doTest("class Identifier {}", { docs: [{ description: "Desc1" }, "\nDesc2"] }, "/** Desc1 */\n/**\n * Desc2\n */\nclass Identifier {}");
        });

        it("should not modify anything if the structure doesn't specify a value", () => {
            doTest("/** Test */\nclass Identifier {}", {}, "/** Test */\nclass Identifier {}");
        });

        it("should replace existing", () => {
            doTest("/** Test */\nclass Identifier {}", { docs: [{ description: "New" }] }, "/** New */\nclass Identifier {}");
        });

        it("should remove existing when structure specifies a value", () => {
            doTest("/** Test */\nclass Identifier {}", { docs: [] }, "class Identifier {}");
        });
    });

    describe(nameof<ClassDeclaration>(n => n.getStructure), () => {
        function doTest(startingCode: string, docTexts: string[]) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(startingCode);
            expect((firstChild.getStructure().docs! as JSDocStructure[]).map(d => d.description)).to.deep.equal(docTexts);
        }

        it("should return empty array when doesn't have one", () => {
            doTest("class Identifier {}", []);
        });

        it("should get the js docs when they exist", () => {
            // js docs that are multi-line, but a single line will have a newline at the start
            doTest("/** Test *//**\n * Test2\n */class Identifier {}", ["Test", "\nTest2"]);
        });
    });
});
