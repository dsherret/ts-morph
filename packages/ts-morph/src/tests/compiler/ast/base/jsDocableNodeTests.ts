import { nameof, NewLineKind, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, FunctionDeclaration, JSDocableNode, Node, VariableStatement } from "../../../../compiler";
import { IndentationText } from "../../../../options";
import { JSDocableNodeStructure, JSDocStructure, OptionalKind } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";

describe("JSDocableNode", () => {
  describe("VariableStatement", () => {
    const { sourceFile } = getInfoFromText("/** Text */\nvar docedComment;\n/** First */\n/** Second */var multiCommented;\nvar nonDocedComment;");
    const statements = sourceFile.getVariableStatements();
    const docedStatement = statements[0];
    const multiDocedStatement = statements[1];
    const nonDocedStatement = statements[2];

    describe(nameof<JSDocableNode>("getJsDocs"), () => {
      describe("documentationed node", () => {
        const nodes = docedStatement.getJsDocs();
        it("should have the right number of nodes", () => {
          expect(nodes.length).to.equal(1);
        });

        it("should have the right node", () => {
          expect(nodes[0].getText()).to.equal("/** Text */");
        });

        it("should have the right node kind", () => {
          expect(nodes[0].getKind()).to.equal(SyntaxKind.JSDoc);
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

  describe("FunctionDeclaration", () => {
    const { firstChild } = getInfoFromText<FunctionDeclaration>("/**\n * Test.\n * @name - Test\n */\nfunction myFunction(name: string) {}");
    const doc = firstChild.getJsDocs()[0];

    it("should have the right node kind", () => {
      expect(doc.getKind()).to.equal(SyntaxKind.JSDoc);
    });
  });

  describe(nameof<JSDocableNode>("insertJsDocs"), () => {
    function doTest(
      startCode: string,
      insertIndex: number,
      structures: (OptionalKind<JSDocStructure> | string | WriterFunction)[],
      expectedCode: string,
      syntaxKind = SyntaxKind.FunctionDeclaration,
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
        "/**\n * Description\n * Other\n */\nfunction identifier() {}",
      );
    });

    it("should insert at start when indentation is different", () => {
      doTest(
        "namespace N {\n    /**\n     * Desc2\n     */\n    function identifier() {}\n}",
        0,
        [{ description: "\nDesc1" }],
        "namespace N {\n    /**\n     * Desc1\n     */\n    /**\n     * Desc2\n     */\n    function identifier() {}\n}",
      );
    });

    it("should insert multiple at end", () => {
      doTest(
        "/**\n * Desc1\n */\nfunction identifier() {}",
        1,
        [{ description: writer => writer.newLine().write("Desc2") }, "Desc3"],
        "/**\n * Desc1\n */\n/**\n * Desc2\n */\n/** Desc3 */\nfunction identifier() {}",
      );
    });

    it("should insert in the middle", () => {
      doTest(
        "/**\n * Desc1\n */\n/**\n * Desc3\n */\nfunction identifier() {}",
        1,
        [writer => writer.write("\nDesc2")],
        "/**\n * Desc1\n */\n/**\n * Desc2\n */\n/**\n * Desc3\n */\nfunction identifier() {}",
      );
    });

    it("should do nothing if empty array", () => {
      doTest("function identifier() {}", 0, [], "function identifier() {}");
    });

    it("should not have trailing whitespace when a line is blank", () => {
      doTest("function identifier() {}", 0, [{ description: "t\n\nu" }], "/**\n * t\n *\n * u\n */\nfunction identifier() {}");
    });

    describe("PropertyDeclaration", () => {
      it("should add a js doc to a property declaration", () => {
        doTest(
          "class C {\n    prop;\n}",
          0,
          [{ description: "\nTesting" }],
          "class C {\n    /**\n     * Testing\n     */\n    prop;\n}",
          SyntaxKind.PropertyDeclaration,
        );
      });
    });
  });

  describe(nameof<JSDocableNode>("insertJsDoc"), () => {
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
        "/** Desc1 */\n/**\n * Desc2\n */\nfunction identifier() {}",
      );
    });
  });

  describe(nameof<JSDocableNode>("addJsDocs"), () => {
    function doTest(startCode: string, structures: (OptionalKind<JSDocStructure> | string)[], expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
      const result = firstChild.addJsDocs(structures);
      expect(result.length).to.equal(structures.length);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
    }

    it("should add multiple at end", () => {
      doTest(
        "/**\n * Desc1\n */\nfunction identifier() {}",
        [{ description: "Desc2" }, "\nDesc3"],
        "/**\n * Desc1\n */\n/** Desc2 */\n/**\n * Desc3\n */\nfunction identifier() {}",
      );
    });
  });

  describe(nameof<JSDocableNode>("addJsDoc"), () => {
    it("should indent a js doc and its inline member on separate lines", () => {
      const { sourceFile } = getInfoFromText("interface I { value: string; }");
      sourceFile.getInterfaceOrThrow("I").getPropertyOrThrow("value").addJsDoc("Description");
      expect(sourceFile.getFullText()).to.equal("interface I { \n    /** Description */\n    value: string; }");
    });

    it("should use the configured newline and indentation for an inline member", () => {
      const { sourceFile, project } = getInfoFromText("interface I { value: string; }");
      project.manipulationSettings.set({
        newLineKind: NewLineKind.CarriageReturnLineFeed,
        indentationText: IndentationText.Tab,
      });
      sourceFile.getInterfaceOrThrow("I").getPropertyOrThrow("value").addJsDoc("Description");
      expect(sourceFile.getFullText()).to.equal("interface I { \r\n\t/** Description */\r\n\tvalue: string; }");
    });

    it("should indent a js doc within a nested inline type", () => {
      const { sourceFile } = getInfoFromText("interface I {\n    nested: { value: string }\n}");
      const node = sourceFile.getDescendantsOfKind(SyntaxKind.PropertySignature).pop()!;
      node.addJsDoc("Description");
      expect(sourceFile.getFullText()).to.equal("interface I {\n    nested: { \n        /** Description */\n        value: string }\n}");
    });

    for (
      const { name, code, kind } of [
        { name: "inline type literal", code: "interface I { nested: { value: string } }", kind: SyntaxKind.PropertySignature },
        { name: "inline interface", code: "interface I { value: string; }", kind: SyntaxKind.PropertySignature },
        { name: "same-line member", code: "interface I { first: string; value: number; }", kind: SyntaxKind.PropertySignature },
        { name: "inline class method", code: "class C { method() {} }", kind: SyntaxKind.MethodDeclaration },
      ]
    ) {
      it(`should recognize the first js doc: ${name}`, () => {
        const { sourceFile } = getInfoFromText(code);
        const node = sourceFile.getDescendantsOfKind(kind).pop()! as Node & JSDocableNode;
        const doc = node.addJsDoc("Description");

        expect(doc).to.be.instanceOf(Node);
        expect(node.getJsDocs()).to.deep.equal([doc]);
        expect(node.print()).to.contain("/** Description */");

        const secondDoc = node.addJsDoc("Second");
        expect(node.getJsDocs()).to.deep.equal([doc, secondDoc]);
      });
    }

    function doTest(startCode: string, structure: OptionalKind<JSDocStructure>, expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
      const result = firstChild.addJsDoc(structure);
      expect(result).to.be.instanceOf(Node);
      expect(sourceFile.getFullText()).to.equal(expectedCode);
    }

    it("should add at the end", () => {
      doTest("/**\n * Desc1\n */\nfunction identifier() {}", { description: "\nDesc2" }, "/**\n * Desc1\n */\n/**\n * Desc2\n */\nfunction identifier() {}");
    });
  });

  describe(nameof<ClassDeclaration>("set"), () => {
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

  describe(nameof<ClassDeclaration>("getStructure"), () => {
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
