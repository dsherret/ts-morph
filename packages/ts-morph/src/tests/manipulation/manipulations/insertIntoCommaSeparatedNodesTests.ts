import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ArrayLiteralExpression, ModuleDeclaration } from "../../../compiler";
import { OptionalKind, PropertyAssignmentStructure, StructureKind } from "../../../structures";
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

    for (
      const [text, expected] of [
        // comma after a line comment
        ["f(a // c\n, b);", "f(a, // c\n    x, b);"],
        ["f(a // c\n /*e*/, b);", "f(a // c\n /*e*/, x, b);"],
        ["f(a // c\n, /*z*/ b);", "f(a, // c\n    /*z*/ x, b);"],
        // comments between the copied comment and the next node
        ["f(a, // c\n // d\n b);", "f(a, // c\n    x,\n // d\n b);"],
        ["f(a, // c\n /*d*/ b);", "f(a, // c\n    x,\n /*d*/ b);"],
        ["f(a,\n /*d*/ b);", "f(a, x,\n /*d*/ b);"],
        // trailing comments of any kind
        ["f(a /*c*/);", "f(a, /*c*/ x);"],
        ["f(a /*c*/, /*d*/);", "f(a /*c*/, /*d*/ x);"],
        ["f(a /*c*/ // d\n);", "f(a, /*c*/ // d\n    x\n);"],
      ]
    ) {
      it(`should keep comments when inserting an argument into ${JSON.stringify(text)}`, () => {
        const { sourceFile } = getInfoFromText(text);
        const call = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.CallExpression);
        call.insertArgument(1, "x");
        expect(sourceFile.getFullText()).to.equal(expected);
        expect(sourceFile.getPreEmitDiagnostics().filter(d => d.getCategory() === 1 && d.getCode() < 2000)).to.deep.equal([]);
      });
    }

    for (const useTrailingCommas of [false, true]) {
      it(`should not keep a comma after a comment node when useTrailingCommas is ${useTrailingCommas}`, () => {
        const { sourceFile, project } = getInfoFromText("const o = {\n  a: 1\n  // mid\n  ,\n};");
        project.manipulationSettings.set({ useTrailingCommas });
        const object = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);
        object.addPropertyAssignment({ name: "x", initializer: "1" });
        expect(sourceFile.getFullText()).to.equal(`const o = {\n  a: 1,\n  // mid\n    x: 1${useTrailingCommas ? "," : ""}\n};`);
      });
    }

    it("should move the comma before a line comment for parameters", () => {
      const { sourceFile } = getInfoFromText("function f(a // c\n, b) {}");
      sourceFile.getFunctionOrThrow("f").insertParameter(1, { name: "x" });
      expect(sourceFile.getFullText()).to.equal("function f(a, // c\n    x, b) {}");
    });

    it("should move the comma before a line comment for type parameters", () => {
      const { sourceFile } = getInfoFromText("function f<A // c\n, B>() {}");
      sourceFile.getFunctionOrThrow("f").insertTypeParameter(1, "X");
      expect(sourceFile.getFullText()).to.equal("function f<A, // c\n    X, B>() {}");
    });

    it("should move the comma before a line comment for named imports", () => {
      const { sourceFile } = getInfoFromText(`import { a // c\n, b } from "./m";`);
      sourceFile.getImportDeclarations()[0].insertNamedImport(1, "x");
      expect(sourceFile.getFullText()).to.equal(`import { a, // c\n    x, b } from "./m";`);
    });

    it("should move the comma before a line comment for named exports", () => {
      const { sourceFile } = getInfoFromText(`export { a // c\n, b } from "./m";`);
      sourceFile.getExportDeclarations()[0].insertNamedExport(1, "x");
      expect(sourceFile.getFullText()).to.equal(`export { a, // c\n    x, b } from "./m";`);
    });

    it("should move the comma before a line comment for implements", () => {
      const { sourceFile } = getInfoFromText("class C implements A // c\n, B {}");
      sourceFile.getClassOrThrow("C").insertImplements(1, "X");
      expect(sourceFile.getFullText()).to.equal("class C implements A, // c\n    X, B {}");
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

  describe("after comment nodes", () => {
    for (const newLine of ["\n", "\r\n"]) {
      const text = `enum E {${newLine}  a${newLine}  // c${newLine}}`;

      it(`should leave the text unchanged when the insert fails with a missing comma and newline ${JSON.stringify(newLine)}`, () => {
        const { sourceFile } = getInfoFromText(text);
        const enumDec = sourceFile.getEnumOrThrow("E");
        const [member, comment] = enumDec.getMembersWithComments();
        expect(() => enumDec.addMember("} enum F {")).to.throw();
        expect(sourceFile.getFullText()).to.equal(text);
        expect(member.getText()).to.equal("a");
        expect(comment.getText()).to.equal("// c");
      });
    }

    it("should leave the text unchanged when an object literal insert fails with a missing comma", () => {
      const text = "const o = {\n  a: 1\n  // c\n};";
      const { sourceFile } = getInfoFromText(text);
      const object = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);
      expect(() => object.addProperty("} + {")).to.throw();
      expect(sourceFile.getFullText()).to.equal(text);
    });

    it("should keep held comment nodes valid when the insert fails after they were mapped", () => {
      const text = "enum E {\n  a\n  // c\n  /* d */\n}";
      const { sourceFile } = getInfoFromText(text);
      const enumDec = sourceFile.getEnumOrThrow("E");
      const comment = enumDec.getMembersWithComments()[1];
      const pos = comment.getPos();
      expect(() => enumDec.insertMember(2, "b /*")).to.throw();
      expect(sourceFile.getFullText()).to.equal(text);
      expect(comment.getPos()).to.equal(pos);
      expect(comment.getText()).to.equal("// c");
      expect(enumDec.getMembersWithComments()[1]).to.equal(comment);
    });

    it("should keep held members attached when the insert fails after they were moved", () => {
      const text = "enum E {\n  a = 1\n  // c\n  /* d */\n}";
      const { sourceFile } = getInfoFromText(text);
      const enumDec = sourceFile.getEnumOrThrow("E");
      const members = enumDec.getMembersWithComments();
      const initializer = enumDec.getMemberOrThrow("a").getInitializerOrThrow();
      expect(() => enumDec.insertMember(2, "z /*")).to.throw();
      expect(sourceFile.getFullText()).to.equal(text);
      expect(enumDec.getMembersWithComments()).to.deep.equal(members);
      expect(enumDec.getMemberOrThrow("a").getInitializerOrThrow()).to.equal(initializer);
      expect(members.map(member => member.getText())).to.deep.equal(["a = 1", "// c", "/* d */"]);
    });

    it("should keep held comment nodes in an enum when a comma follows them", () => {
      const { sourceFile } = getInfoFromText("enum E {\n  a\n  // c\n  /* d */\n  ,\n}");
      const enumDec = sourceFile.getEnumOrThrow("E");
      const [member, first, second] = enumDec.getMembersWithComments();
      enumDec.addMember("b");
      expect(sourceFile.getFullText()).to.equal("enum E {\n  a,\n  // c\n  /* d */\n    b\n}");
      expect(first.getText()).to.equal("// c");
      expect(second.getText()).to.equal("/* d */");
      expect(enumDec.getMembersWithComments().slice(0, 3)).to.deep.equal([member, first, second]);
    });

    it("should keep a held comment node in an object literal when a comma follows it", () => {
      const { sourceFile } = getInfoFromText("const o = {\n  a: 1\n  // c\n  ,\n};");
      const object = sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ObjectLiteralExpression);
      const [property, comment] = object.getPropertiesWithComments();
      object.addPropertyAssignment({ name: "b", initializer: "2" });
      expect(sourceFile.getFullText()).to.equal("const o = {\n  a: 1,\n  // c\n    b: 2\n};");
      expect(comment.getText()).to.equal("// c");
      expect(object.getPropertiesWithComments().slice(0, 2)).to.deep.equal([property, comment]);
    });

    it("should keep a held comment node when adding a missing comma", () => {
      const { sourceFile } = getInfoFromText("enum E {\n  a\n  // c\n}");
      const enumDec = sourceFile.getEnumOrThrow("E");
      const comment = enumDec.getMembersWithComments()[1];
      enumDec.addMember("b");
      expect(sourceFile.getFullText()).to.equal("enum E {\n  a,\n  // c\n    b\n}");
      expect(comment.getText()).to.equal("// c");
      expect(enumDec.getMembersWithComments()[1]).to.equal(comment);
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

    it("should not duplicate a comma before a standalone comment when appending", () => {
      doTest(
        "const t = {\n    prop1: 1,\n    // test\n};",
        2,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    prop1: 1,\n    // test\n    prop2: 4\n};",
      );
    });

    it("should preserve comments before and after a comma when inserting after a standalone comment", () => {
      doTest(
        "const t = {\n    prop1: 1 /* before */, /* after */\n    // test\n    prop3: 3\n};",
        2,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    prop1: 1 /* before */, /* after */\n    // test\n    prop2: 4,\n    prop3: 3\n};",
      );
    });

    it("should preserve multiple standalone comments and their trailing ranges after a comma", () => {
      doTest(
        "const t = {\n    prop1: 1,\n    // first\n    /* second */ // trailing\n};",
        3,
        [{ name: "prop2", initializer: "4" }],
        "const t = {\n    prop1: 1,\n    // first\n    /* second */ // trailing\n    prop2: 4\n};",
      );
    });

    it("should add a missing comma before appending a computed property after a comment", () => {
      doTest(
        "const t = {\n    prop1: 1\n    // test\n};",
        2,
        [{ name: "[k]", initializer: "2" }],
        "const t = {\n    prop1: 1,\n    // test\n    [k]: 2\n};",
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

    it("should not add a trailing comma when inserting a comment after the last property", () => {
      const { sourceFile, objectLiteralExpression } = getObjectLiteralExpression("const o = {\n    p1: 5\n};");
      const prop = objectLiteralExpression.getPropertyOrThrow("p1");
      const inserted = objectLiteralExpression.insertProperty(prop.getChildIndex() + 1, "// 1");
      expect(sourceFile.getFullText()).to.equal("const o = {\n    p1: 5\n    // 1\n};");
      expect(inserted.getText()).to.equal("// 1");
    });

    it("should not add a trailing comma when inserting a comment after an existing trailing comment", () => {
      const { sourceFile, objectLiteralExpression } = getObjectLiteralExpression("const o = {\n    p1: 5\n    // 1\n};");
      const inserted = objectLiteralExpression.insertProperty(2, "// 2");
      expect(sourceFile.getFullText()).to.equal("const o = {\n    p1: 5\n    // 1\n    // 2\n};");
      expect(inserted.getText()).to.equal("// 2");
    });

    it("should not add a trailing comma when inserting multiple comments after the last property", () => {
      const { sourceFile, objectLiteralExpression } = getObjectLiteralExpression("const o = {\n    p1: 5\n};");
      objectLiteralExpression.insertProperties(1, ["// 1", "/* 2 */"]);
      expect(sourceFile.getFullText()).to.equal("const o = {\n    p1: 5\n    // 1\n    /* 2 */\n};");
    });

    it("should add a comma when inserting a comment followed by a property after the last property", () => {
      const { sourceFile, objectLiteralExpression } = getObjectLiteralExpression("const o = {\n    p1: 5\n};");
      objectLiteralExpression.insertProperties(1, ["// 1", { kind: StructureKind.PropertyAssignment, name: "p2", initializer: "6" }]);
      expect(sourceFile.getFullText()).to.equal("const o = {\n    p1: 5,\n    // 1\n    p2: 6\n};");
    });

    it("should not add a trailing comma when inserting a comment between the last property and an existing comment", () => {
      const { sourceFile, objectLiteralExpression } = getObjectLiteralExpression("const o = {\n    p1: 5\n    // 2\n};");
      objectLiteralExpression.insertProperty(1, "// 1");
      expect(sourceFile.getFullText()).to.equal("const o = {\n    p1: 5\n    // 1\n    // 2\n};");
    });

    it("should not add a trailing comma when inserting a comment after a property with a trailing inline comment", () => {
      const { sourceFile, objectLiteralExpression } = getObjectLiteralExpression("const o = {\n    p1: 5 // existing\n};");
      objectLiteralExpression.insertProperty(1, "// 1");
      expect(sourceFile.getFullText()).to.equal("const o = {\n    p1: 5 // existing\n    // 1\n};");
    });

    it("should preserve an existing trailing comma when inserting a comment after the last property", () => {
      const { sourceFile, objectLiteralExpression } = getObjectLiteralExpression("const o = {\n    p1: 5,\n};");
      objectLiteralExpression.insertProperty(1, "// 1");
      expect(sourceFile.getFullText()).to.equal("const o = {\n    p1: 5,\n    // 1\n};");
    });

    it("should not add a trailing comma when inserting a comment with useTrailingCommas enabled", () => {
      const { sourceFile, project, objectLiteralExpression } = getObjectLiteralExpression("const o = {\n    p1: 5\n};");
      project.manipulationSettings.set({ useTrailingCommas: true });
      objectLiteralExpression.insertProperty(1, "// 1");
      expect(sourceFile.getFullText()).to.equal("const o = {\n    p1: 5\n    // 1\n};");
    });

    it("should not add a trailing comma when inserting a comment after the last enum member", () => {
      const { sourceFile } = getInfoFromText("enum E {\n    A\n}");
      const enumDec = sourceFile.getEnumOrThrow("E");
      const inserted = enumDec.insertMember(1, "// 1");
      expect(sourceFile.getFullText()).to.equal("enum E {\n    A\n    // 1\n}");
      expect(inserted.getText()).to.equal("// 1");
    });

    it("should not add a trailing comma when inserting a comment after a trailing comment in an enum", () => {
      const { sourceFile } = getInfoFromText("enum E {\n    A\n    // 1\n}");
      const enumDec = sourceFile.getEnumOrThrow("E");
      const inserted = enumDec.insertMember(2, "// 2");
      expect(sourceFile.getFullText()).to.equal("enum E {\n    A\n    // 1\n    // 2\n}");
      expect(inserted.getText()).to.equal("// 2");
    });
  });
});
