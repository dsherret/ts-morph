import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ArrayLiteralExpression, ModuleDeclaration } from "../../../compiler";
import { OptionalKind, PropertyAssignmentStructure } from "../../../structures";
import { WriterFunction } from "../../../types";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../compiler/testHelpers";

describe("insertIntoCommaSeparatedNodes", () => {
  // these are high level tests of this function
  describe("trailing line comments", () => {
    for (const comma of ["", ","]) {
      it(`should append an argument after a trailing line comment with comma '${comma}'`, () => {
        const { sourceFile } = getInfoFromText(`f(\n    1${comma} // one\n);`);
        const call = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression);
        const added = call.addArgument("2");
        expect(sourceFile.getFullText()).to.equal("f(\n    1, // one\n    2\n);");
        expect(call.getArguments().map(arg => arg.getText())).to.deep.equal(["1", "2"]);
        expect(added).to.equal(call.getArguments()[1]);
      });
      it(`should append a parameter after a trailing line comment with comma '${comma}'`, () => {
        const { sourceFile } = getInfoFromText(`function f(\n    a: number${comma} // one\n) {}`);
        const func = sourceFile.getFunctionOrThrow("f");
        const added = func.addParameter({ name: "b", type: "string" });
        expect(sourceFile.getFullText()).to.equal("function f(\n    a: number, // one\n    b: string\n) {}");
        expect(func.getParameters().map(param => param.getName())).to.deep.equal(["a", "b"]);
        expect(added).to.equal(func.getParameters()[1]);
      });
      it(`should append a type argument after a trailing line comment with comma '${comma}'`, () => {
        const { sourceFile } = getInfoFromText(`f<\n    string${comma} // one\n>();`);
        const call = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression);
        const added = call.addTypeArgument("number");
        expect(sourceFile.getFullText()).to.equal("f<\n    string, // one\n    number\n>();");
        expect(call.getTypeArguments().map(arg => arg.getText())).to.deep.equal(["string", "number"]);
        expect(added).to.equal(call.getTypeArguments()[1]);
      });
    }

    it("should insert between arguments after a trailing line comment", () => {
      const { sourceFile } = getInfoFromText("f(1, // one\n    3);");
      const call = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression);
      const added = call.insertArgument(1, "2");
      expect(sourceFile.getFullText()).to.equal("f(1, // one\n    2, 3);");
      expect(call.getArguments().map(arg => arg.getText())).to.deep.equal(["1", "2", "3"]);
      expect(added).to.equal(call.getArguments()[1]);
    });

    it("should append a type parameter after a trailing line comment", () => {
      const { sourceFile } = getInfoFromText("function f<\n    T // one\n>() {}");
      const func = sourceFile.getFunctionOrThrow("f");
      const added = func.addTypeParameter({ name: "U" });
      expect(sourceFile.getFullText()).to.equal("function f<\n    T, // one\n    U\n>() {}");
      expect(func.getTypeParameters().map(param => param.getName())).to.deep.equal(["T", "U"]);
      expect(added).to.equal(func.getTypeParameters()[1]);
    });
  });

  describe("named imports", () => {
    function doTest(text: string, index: number, writerFunction: WriterFunction, expected: string, surroundWithSpaces = true) {
      const { firstChild } = getInfoFromText<ModuleDeclaration>(`declare namespace Test {\n    import ${text} from "./test";\n}\n`);
      const importDec = firstChild.getImportDeclarations()[0];
      if (!surroundWithSpaces)
        firstChild._context.manipulationSettings.set({ insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false });
      importDec.insertNamedImports(index, writerFunction);
      expect(importDec.getImportClauseOrThrow().getNamedBindingsOrThrow().getText()).to.equal(expected);
    }

    it("should insert at the start when it shouldn't use a space", () => {
      doTest(`{name2}`, 0, writer => writer.write("name1"), `{name1, name2}`, false);
    });

    it("should insert in the middle when it shouldn't use a space", () => {
      doTest(`{name1, name3}`, 1, writer => writer.write("name2"), `{name1, name2, name3}`, false);
    });

    it("should insert at the end when it shouldn't use a space", () => {
      doTest(`{name1, name2}`, 2, writer => writer.write("name3"), `{name1, name2, name3}`, false);
    });

    it("should insert at the start using newlines when it shouldn't use a space", () => {
      doTest(`{\n        name2\n    }`, 0, writer => writer.newLine().writeLine("name1"), `{\n        name1,\n        name2\n    }`, false);
    });

    it("should insert in the middle using newlines when it shouldn't use a space", () => {
      doTest(
        `{\n        name1,\n        name3\n    }`,
        1,
        writer => writer.newLine().writeLine("name2"),
        `{\n        name1,\n        name2,\n        name3\n    }`,
        false,
      );
    });

    it("should insert at the end using newlines when it shouldn't use a space", () => {
      doTest(`{\n        name1\n    }`, 1, writer => writer.newLine().writeLine("name2"), `{\n        name1,\n        name2\n    }`, false);
    });

    it("should insert at the start", () => {
      doTest(`{ name2 }`, 0, writer => writer.write("name1"), `{ name1, name2 }`);
    });

    it("should insert in middle", () => {
      doTest(`{ name1, name3 }`, 1, writer => writer.write("name2"), `{ name1, name2, name3 }`);
    });

    it("should insert at end", () => {
      doTest(`{ name1 }`, 1, writer => writer.write("name2"), `{ name1, name2 }`);
    });

    it("should insert at the start when writing newlines", () => {
      doTest(
        `{\n        name2\n    }`,
        0,
        writer => writer.newLine().writeLine("name1"),
        `{\n        name1,\n        name2\n    }`,
      );
    });

    it("should insert in middle when writing newlines", () => {
      doTest(
        `{\n        name1,\n        name3\n    }`,
        1,
        writer => writer.newLine().writeLine("name2"),
        `{\n        name1,\n        name2,\n        name3\n    }`,
      );
    });

    it("should insert at end when writing newlines", () => {
      doTest(`{\n        name1\n    }`, 1, writer => writer.newLine().writeLine("name2"), `{\n        name1,\n        name2\n    }`);
    });

    it("should insert when none exist", () => {
      doTest(`{}`, 0, writer => writer.write("name1"), `{ name1 }`);
    });

    it("should insert when none exist and writing surrounding newlines", () => {
      doTest(`{}`, 0, writer => writer.newLine().writeLine("name1"), `{\n        name1\n    }`);
    });

    it("should not append a comma if the user wrote one", () => {
      doTest(`{name2}`, 0, writer => writer.write("name1,"), `{name1, name2}`, false);
    });
  });

  describe("array", () => {
    function doTest(text: string, index: number, writerFunction: WriterFunction, expected: string) {
      text = "namespace Test {\n    const t = " + text + ";\n}";
      const { descendant } = getInfoFromTextWithDescendant<ArrayLiteralExpression>(text, SyntaxKind.ArrayLiteralExpression);
      descendant.insertElements(index, writerFunction);
      expect(descendant.getText()).to.equal(expected);
    }

    it("should insert at the start", () => {
      doTest(`[name2]`, 0, writer => writer.write("name1"), `[name1, name2]`);
    });

    it("should insert in middle", () => {
      doTest(`[name1, name3]`, 1, writer => writer.write("name2"), `[name1, name2, name3]`);
    });

    it("should insert at end", () => {
      doTest(`[name1]`, 1, writer => writer.write("name2"), `[name1, name2]`);
    });

    it("should insert at the start with newlines", () => {
      doTest(
        `[\n        name2\n    ]`,
        0,
        writer => writer.newLine().writeLine("name1"),
        `[\n        name1,\n        name2\n    ]`,
      );
    });

    it("should insert in middle with newlines", () => {
      doTest(
        `[\n        name1,\n        name3\n    ]`,
        1,
        writer => writer.newLine().writeLine("name2"),
        `[\n        name1,\n        name2,\n        name3\n    ]`,
      );
    });

    it("should insert at end with newlines", () => {
      doTest(
        `[\n        name1\n    ]`,
        1,
        writer => writer.newLine().writeLine("name2"),
        `[\n        name1,\n        name2\n    ]`,
      );
    });

    it("should insert at the start when no other elements", () => {
      doTest(`[]`, 0, writer => writer.write("name1"), `[name1]`);
    });

    it("should insert at the start when no other elements on a new line", () => {
      doTest(`[]`, 0, writer => writer.newLine().writeLine("name1"), `[\n        name1\n    ]`);
    });
  });

  function getObjectLiteralExpression(text: string) {
    const opts = getInfoFromText(text);
    const objectLiteralExpression = opts.sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);
    return {
      objectLiteralExpression,
      ...opts,
    };
  }

  describe("object literal expression", () => {
    function doTest(text: string, index: number, structures: OptionalKind<PropertyAssignmentStructure>[], expectedText: string) {
      const { sourceFile, objectLiteralExpression } = getObjectLiteralExpression(text);
      const result = objectLiteralExpression.insertPropertyAssignments(index, structures);
      expect(sourceFile.getFullText()).to.equal(expectedText);
      expect(result.length).to.deep.equal(structures.length);
    }

    it("should take into account inserting after a comment", () => {
      doTest(
        "const t = {\n    // test\n};",
        1,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    // test\n    prop2: 4\n};",
      );
    });

    it("should take into account inserting after a comment when there exists a node before that comment with no comma", () => {
      doTest(
        "const t = {\n    prop1\n    // test\n};",
        2,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    prop1,\n    // test\n    prop2: 4\n};",
      );
    });

    it("should take into account inserting after a comment with a trailing comment when there exists a node before that comment with no comma", () => {
      doTest(
        "const t = {\n    prop1\n    /* 1 */ // 2\n};",
        2,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    prop1,\n    /* 1 */ // 2\n    prop2: 4\n};",
      );
    });

    it("should take into account comments in the index", () => {
      doTest(
        "const t = {\n    // test\n    prop1: 5\n};",
        2,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    // test\n    prop1: 5,\n    prop2: 4\n};",
      );
    });

    it("should take into account inserting before a comment", () => {
      doTest(
        "const t = {\n    // test\n};",
        0,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    prop2: 4\n    // test\n};",
      );
    });

    it("should take into account inserting before a comment that has a non-comment node after", () => {
      doTest(
        "const t = {\n    // test\n    p};",
        0,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    prop2: 4,\n    // test\n    p};",
      );
    });

    it("should take into account inserting before a comment with a preceeding node", () => {
      doTest(
        "const t = {\n    p\n    // test\n};",
        1,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    p,\n    prop2: 4\n    // test\n};",
      );
    });

    it("should insert a template string with /* before a preceeding node correctly", () => {
      doTest(
        "const t = {\n    prop1\n};",
        0,
        [{ name: "prop2", initializer: "`${p}/*`" }],
        "const t = {\n    prop2: `${p}/*`,\n    prop1\n};",
      );
    });
  });
});
