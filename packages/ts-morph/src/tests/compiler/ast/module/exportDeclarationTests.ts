import { errors, nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ExportDeclaration } from "../../../../compiler";
import { Project } from "../../../../Project";
import { AssertEntryStructure, ExportDeclarationStructure, ExportSpecifierStructure, OptionalKind, StructureKind } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { getInfoFromText, getInfoFromTextWithDescendant, OptionalKindAndTrivia, OptionalTrivia } from "../../testHelpers";

describe("ExportDeclaration", () => {
  describe(nameof<ExportDeclaration>("isTypeOnly"), () => {
    function doTest(text: string, expected: boolean) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(firstChild.isTypeOnly()).to.equal(expected);
    }

    it("should be when is", () => {
      doTest("export type { Test } from './test'", true);
    });

    it("should not be when not", () => {
      doTest("export { Test } from './test'", false);
    });
  });

  describe(nameof<ExportDeclaration>("setIsTypeOnly"), () => {
    function doTest(text: string, value: boolean, expectedText: string) {
      const { sourceFile, firstChild } = getInfoFromText<ExportDeclaration>(text);
      firstChild.setIsTypeOnly(value);
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should leave alone when setting the same for named exports", () => {
      doTest("export type { Test } from './test'", true, "export type { Test } from './test'");
      doTest("export { Test } from './test'", false, "export { Test } from './test'");
      doTest("export * as test from './test'", false, "export * as test from './test'");
    });

    it("should set when not for named exports", () => {
      doTest("export { Test } from './test'", true, "export type { Test } from './test'");
    });

    it("should set not when is for named exports", () => {
      doTest("export type { Test } from './test'", false, "export { Test } from './test'");
    });

    it("should leave alone when setting the same for namespace export", () => {
      doTest("export type * as test from './test'", true, "export type * as test from './test'");
      doTest("export * as test from './test'", false, "export * as test from './test'");
    });

    it("should set when not for namespace export", () => {
      doTest("export * as test from './test'", true, "export type * as test from './test'");
    });

    it("should set not when is for namespace export", () => {
      doTest("export type * as test from './test'", false, "export * as test from './test'");
    });

    it("should leave alone when setting the same for namespace export with no name", () => {
      doTest("export type * from './test'", true, "export type * from './test'");
      doTest("export * from './test'", false, "export * from './test'");
    });

    it("should set when not for namespace export with no name", () => {
      doTest("export * from './test'", true, "export type * from './test'");
    });

    it("should set not when is for namespace export with no name", () => {
      doTest("export type * from './test'", false, "export * from './test'");
    });
  });

  describe(nameof<ExportDeclaration>("setNamespaceExport"), () => {
    function doTest(text: string, value: string, expected: string) {
      const { firstChild, sourceFile } = getInfoFromText<ExportDeclaration>(text);
      firstChild.setNamespaceExport(value);
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should set the namespace export when a * export", () => {
      doTest("export * from 'test';", "ns", "export * as ns from 'test';");
    });

    it("should set the namespace export when a * as ns export", () => {
      doTest("export * as ns from 'test';", "ns2", "export * as ns2 from 'test';");
    });

    it("should set the namespace export when a named export", () => {
      doTest("export { test } from 'test';", "ns", "export * as ns from 'test';");
    });
  });

  describe(nameof<ExportDeclaration>("getNamespaceExport"), () => {
    function doTest(text: string, expected: string | undefined) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(firstChild.getNamespaceExport()?.getText()).to.equal(expected);
      if (expected == null)
        expect(() => firstChild.getNamespaceExportOrThrow()).to.throw();
      else
        expect(firstChild.getNamespaceExportOrThrow().getText()).to.equal(expected);
    }

    it("should be undefined for * export", () => {
      doTest("export * from 'test';", undefined);
    });

    it("should be undefined for named exports", () => {
      doTest("export { test } from 'test';", undefined);
    });

    it("should get for * as ns export", () => {
      doTest("export * as ns from 'test';", "* as ns");
    });
  });

  describe(nameof<ExportDeclaration>("isNamespaceExport"), () => {
    function doTest(text: string, expected: boolean) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(firstChild.isNamespaceExport()).to.equal(expected);
    }

    it("should be a namespace export when is one", () => {
      doTest("export * from './test'", true);
    });

    it("should be a namespace export when is one with a name", () => {
      doTest("export * as ns from './test'", true);
    });

    it("should not be a namespace export when is a named export", () => {
      doTest(`export {name} from "./test"`, false);
    });
  });

  describe(nameof<ExportDeclaration>("hasNamedExports"), () => {
    function doTest(text: string, expected: boolean) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(firstChild.hasNamedExports()).to.equal(expected);
    }

    it("should not have any named exports when is a namespace export", () => {
      doTest("export * from './test'", false);
    });

    it("should not have any named exports when is a namespace export with a name", () => {
      doTest("export * as ns from './test'", false);
    });

    it("should have named exports when has one", () => {
      doTest(`export {name} from "./test"`, true);
    });
  });

  describe(nameof<ExportDeclaration>("setModuleSpecifier"), () => {
    function doTest(text: string, newModuleSpecifier: string, expected: string) {
      const { firstChild, sourceFile } = getInfoFromText<ExportDeclaration>(text);
      firstChild.setModuleSpecifier(newModuleSpecifier);
      expect(sourceFile.getText()).to.equal(expected);
    }

    it("should set the module specifier when using single quotes", () => {
      doTest(`export * from './test';`, "./new-test", `export * from './new-test';`);
    });

    it("should set the module specifier when using double quotes", () => {
      doTest(`export * from "./test";`, "./new-test", `export * from "./new-test";`);
    });

    it("should set the module specifier when it's empty", () => {
      doTest(`export * from "";`, "./new-test", `export * from "./new-test";`);
    });

    it("should set the module specifier when it doesn't exist", () => {
      doTest(`export {test};`, "./new-test", `export {test} from "./new-test";`);
    });

    it("should set the module specifier when it doesn't exist and there's no semi-colon", () => {
      doTest(`export {test}`, "./new-test", `export {test} from "./new-test"`);
    });

    it("should remove when specifying an empty string", () => {
      doTest(`export {test} from './test';`, "", `export {test};`);
    });

    it("should set the module specifier when it's provided a source file", () => {
      doTest(`export {test}`, "./new-test", `export {test} from "./new-test"`);
      const { firstChild, sourceFile } = getInfoFromText<ExportDeclaration>(`export {test} from "./other";`);
      firstChild.setModuleSpecifier(sourceFile.copy("newFile.ts"));
      expect(sourceFile.getText()).to.equal(`export {test} from "./newFile";`);
    });
  });

  describe(nameof<ExportDeclaration>("getModuleSpecifier"), () => {
    function doTest(text: string, expected: string | undefined) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(firstChild.getModuleSpecifier()?.getText()).to.equal(expected);
    }

    it("should get the module specifier text", () => {
      doTest("export * from './test'", "'./test'");
    });

    it("should return undefined when it doesn't exist", () => {
      doTest(`export {name}`, undefined);
    });
  });

  describe(nameof<ExportDeclaration>("getModuleSpecifierValue"), () => {
    function doTest(text: string, expected: string | undefined) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(firstChild.getModuleSpecifierValue()).to.equal(expected);
    }

    it("should get the module specifier when using single quotes", () => {
      doTest("export * from './test'", "./test");
    });

    it("should get the module specifier when using double quotes", () => {
      doTest(`export {name} from "./test"`, "./test");
    });

    it("should return undefined when it doesn't exist", () => {
      doTest(`export {name}`, undefined);
    });
  });

  describe(nameof<ExportDeclaration>("hasModuleSpecifier"), () => {
    function doTest(text: string, expected: boolean) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(firstChild.hasModuleSpecifier()).to.equal(expected);
    }

    it("should have a module specifier when using single quotes", () => {
      doTest("export * from './test'", true);
    });

    it("should have a module specifier when using double quotes", () => {
      doTest(`export {name} from "./test"`, true);
    });

    it("should not have a module specifier when one doesn't exist", () => {
      doTest(`export {name}`, false);
    });
  });

  describe(nameof<ExportDeclaration>("removeModuleSpecifier"), () => {
    function doTest(text: string, expected: string) {
      const { firstChild, sourceFile } = getInfoFromText<ExportDeclaration>(text);
      firstChild.removeModuleSpecifier();
      expect(sourceFile.getFullText()).to.equal(expected);
    }

    it("should remove the module specifier when it's a named export", () => {
      doTest(`export {name} from "./test";`, `export {name};`);
    });

    it("should do nothing when it doesn't exist", () => {
      doTest(`export {name};`, `export {name};`);
    });

    it("should throw when removing from a namespace export", () => {
      const { firstChild } = getInfoFromText<ExportDeclaration>("export * from './test';");
      expect(() => firstChild.removeModuleSpecifier()).to.throw(errors.InvalidOperationError);
    });
  });

  describe(nameof<ExportDeclaration>("getModuleSpecifierSourceFileOrThrow"), () => {
    it("should get the source file when it exists", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);
      const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

      expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFileOrThrow()).to.equal(classSourceFile);
    });

    it("should throw when the referenced file doesn't exist", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);

      expect(() => mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFileOrThrow()).to.throw();
    });

    it("should throw when there is no module specifier", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const mainSourceFile = project.createSourceFile("main.ts", `export {MyClass};`);

      expect(() => mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFileOrThrow()).to.throw();
    });
  });

  describe(nameof<ExportDeclaration>("getModuleSpecifierSourceFile"), () => {
    it("should get the source file when it exists", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);
      const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

      expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFile()).to.equal(classSourceFile);
    });

    it("should get the source file when it's an index.ts file", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);
      const classSourceFile = project.createSourceFile("class/index.ts", `export class Class {}`);

      expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFile()).to.equal(classSourceFile);
    });

    it("should return undefined when the referenced file doesn't exist", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);

      expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFile()).to.be.undefined;
    });

    it("should return undefined when there is no module specifier", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const mainSourceFile = project.createSourceFile("main.ts", `export {MyClass};`);

      expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFile()).to.be.undefined;
    });
  });

  describe(nameof<ExportDeclaration>("isModuleSpecifierRelative"), () => {
    function doTest(text: string, expected: boolean) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(firstChild.isModuleSpecifierRelative()).to.equal(expected);
    }

    it("should be when using ./", () => {
      doTest("export * from './test'", true);
    });

    it("should be when using ../", () => {
      doTest("export * from '../test'", true);
    });

    it("should not be when using /", () => {
      doTest("export * from '/test'", false);
    });

    it("should not be when not", () => {
      doTest("export * from 'test'", false);
    });

    it("should not be when not existing", () => {
      doTest("export {test}", false);
    });
  });

  describe(nameof<ExportDeclaration>("getNamedExports"), () => {
    function doTest(text: string, expected: { name: string; alias?: string }[]) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      const namedExports = firstChild.getNamedExports();
      expect(namedExports.length).to.equal(expected.length);
      for (let i = 0; i < namedExports.length; i++) {
        expect(namedExports[i].getNameNode().getText()).to.equal(expected[i].name);
        if (expected[i].alias == null)
          expect(namedExports[i].getAliasNode()).to.equal(undefined);
        else
          expect(namedExports[i].getAliasNode()!.getText()).to.equal(expected[i].alias);
      }
    }

    it("should get the named exports", () => {
      doTest(`export {name, name2, name3 as name4} from "./test";`, [{ name: "name" }, { name: "name2" }, { name: "name3", alias: "name4" }]);
    });

    it("should not get anything when only a namespace export exists", () => {
      doTest(`export * from "./test";`, []);
    });
  });

  describe(nameof<ExportDeclaration>("insertNamedExports"), () => {
    function doTest(
      text: string,
      index: number,
      structures: (OptionalKind<ExportSpecifierStructure> | string | WriterFunction)[] | WriterFunction,
      expected: string,
      surroundWithSpaces = true,
    ) {
      const { descendant, sourceFile } = getInfoFromTextWithDescendant<ExportDeclaration>(text, SyntaxKind.ExportDeclaration);
      if (!surroundWithSpaces)
        descendant._context.manipulationSettings.set({ insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false });
      const originalCount = descendant.getNamedExports().length;
      const result = descendant.insertNamedExports(index, structures);
      const afterCount = descendant.getNamedExports().length;

      expect(result.length).to.equal(afterCount - originalCount);
      expect(sourceFile.getText()).to.equal(expected);
    }

    it("should insert named exports when doing a namespace export", () => {
      doTest(`export * from "./test";`, 0, [{ name: "name", alias: "alias" }], `export { name as alias } from "./test";`);
    });

    it("should insert named exports when doing a namespace export with a name", () => {
      doTest(`export * as ns from "./test";`, 0, [{ name: "name", alias: "alias" }], `export { name as alias } from "./test";`);
    });

    it("should insert named exports at the start", () => {
      doTest(
        `export { name3 } from "./test";`,
        0,
        [{ name: "name1" }, writer => writer.write("name2")],
        `export { name1, name2, name3 } from "./test";`,
      );
    });

    it("should insert named exports at the start when it shouldn't use a space", () => {
      doTest(`export {name2} from "./test";`, 0, ["name1"], `export {name1, name2} from "./test";`, false);
    });

    it("should insert named exports at the end", () => {
      doTest(`export { name1 } from "./test";`, 1, ["name2", { name: "name3" }], `export { name1, name2, name3 } from "./test";`);
    });

    it("should insert named exports at the end when it shouldn't use a space", () => {
      doTest(`export {name1} from "./test";`, 1, ["name2"], `export {name1, name2} from "./test";`, false);
    });

    it("should insert named exports in the middle", () => {
      doTest(`export {name1, name4} from "./test";`, 1, [{ name: "name2" }, { name: "name3" }], `export {name1, name2, name3, name4} from "./test";`);
    });

    it("should insert named exports when there are none", () => {
      doTest(`export { } from "./test";`, 0, [{ name: "name1" }], `export { name1 } from "./test";`);
    });

    it("should insert named exports on multiple lines when there are none", () => {
      doTest(
        `declare module Test {\n    export { };\n}`,
        0,
        writer => writer.newLine().writeLine("name1"),
        `declare module Test {\n    export {\n        name1\n    };\n}`,
      );
    });

    it("should insert multiple with a writer", () => {
      doTest(
        `export { name3 } from "./test";`,
        0,
        writer => writer.writeLine("name1,").writeLine("name2,"),
        `export { name1,\n    name2,\n    name3 } from "./test";`,
      );
    });

    it("should insert multiple with a writer starting on a newline", () => {
      doTest(
        `export { name3 } from "./test";`,
        0,
        writer => writer.newLine().writeLine("name1,").write("name2"),
        `export {\n    name1,\n    name2, name3 } from "./test";`,
      );
    });

    it("should insert multiple with a writer and indent the last newline", () => {
      doTest(
        `export { name3 } from "./test";`,
        0,
        writer => writer.newLine().writeLine("name1,").writeLine("name2"),
        `export {\n    name1,\n    name2,\n    name3 } from "./test";`,
      );
    });
  });

  describe(nameof<ExportDeclaration>("insertNamedExport"), () => {
    function doTest(text: string, index: number, structureOrName: OptionalKind<ExportSpecifierStructure> | string, expected: string) {
      const { firstChild, sourceFile } = getInfoFromText<ExportDeclaration>(text);
      firstChild.insertNamedExport(index, structureOrName);
      expect(sourceFile.getText()).to.equal(expected);
    }

    it("should insert at the specified index", () => {
      doTest(`export {name1, name3} from "./test";`, 1, { name: "name2" }, `export {name1, name2, name3} from "./test";`);
    });

    it("should insert at the specified index as a string", () => {
      doTest(`export {name1, name3} from "./test";`, 1, "name2", `export {name1, name2, name3} from "./test";`);
    });
  });

  describe(nameof<ExportDeclaration>("addNamedExport"), () => {
    function doTest(text: string, structureOrName: OptionalKind<ExportSpecifierStructure> | string, expected: string) {
      const { firstChild, sourceFile } = getInfoFromText<ExportDeclaration>(text);
      firstChild.addNamedExport(structureOrName);
      expect(sourceFile.getText()).to.equal(expected);
    }

    it("should add at the end", () => {
      doTest(`export { name1, name2 } from "./test";`, { name: "name3" }, `export { name1, name2, name3 } from "./test";`);
    });

    it("should add at the end as a string", () => {
      doTest(`export { name1, name2 } from "./test";`, "name3", `export { name1, name2, name3 } from "./test";`);
    });
  });

  describe(nameof<ExportDeclaration>("addNamedExports"), () => {
    function doTest(text: string, structures: (OptionalKind<ExportSpecifierStructure> | string)[], expected: string) {
      const { firstChild, sourceFile } = getInfoFromText<ExportDeclaration>(text);
      firstChild.addNamedExports(structures);
      expect(sourceFile.getText()).to.equal(expected);
    }

    it("should add named exports at the end", () => {
      doTest(`export { name1 } from "./test";`, [{ name: "name2" }, "name3"], `export { name1, name2, name3 } from "./test";`);
    });
  });

  describe(nameof<ExportDeclaration>("remove"), () => {
    function doTest(text: string, index: number, expectedText: string) {
      const { sourceFile } = getInfoFromText(text);
      sourceFile.getExportDeclarations()[index].remove();
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should remove the export declaration", () => {
      doTest("export * from 'i';\nexport * from 'j';\nexport * from 'k';\n", 1, "export * from 'i';\nexport * from 'k';\n");
    });
  });

  describe(nameof<ExportDeclaration>("toNamespaceExport"), () => {
    function doTest(text: string, expectedText: string) {
      const { sourceFile, firstChild } = getInfoFromText<ExportDeclaration>(text);
      firstChild.toNamespaceExport();
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should throw when no module specifier exists", () => {
      const { sourceFile, firstChild } = getInfoFromText<ExportDeclaration>(`export {name};`);
      expect(() => firstChild.toNamespaceExport()).to.throw(errors.InvalidOperationError);
    });

    it("should change to a namespace import when there's only one to remove", () => {
      doTest(`export {name} from "./test";`, `export * from "./test";`);
    });

    it("should change to a namespace import when there's multiple to remove", () => {
      doTest(`export {name, name2, name3, name4} from "./test";`, `export * from "./test";`);
    });
  });

  describe(nameof<ExportDeclaration>("set"), () => {
    function doTest(text: string, structure: Partial<ExportDeclarationStructure>, expectedText: string) {
      const { firstChild, sourceFile } = getInfoFromText<ExportDeclaration>(text);
      firstChild.set(structure);
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should not change when nothing is set and it's a namespace export", () => {
      const code = "export * from 'test';";
      doTest(code, {}, code);
    });

    it("should not change when nothing is set and it's has named exports", () => {
      const code = "export { test } from 'test';";
      doTest(code, {}, code);
    });

    it("should change to a namespace export when specifies undefined for named exports", () => {
      doTest("export { test } from 'test';", { namedExports: undefined }, "export * from 'test';");
    });

    it("should remove the named exports when specifying an empty array", () => {
      doTest("export { test1, test2 } from 'test';", { namedExports: [] }, "export { } from 'test';");
    });

    it("should remove the module specifier when specifying", () => {
      doTest("export { test } from 'test';", { moduleSpecifier: undefined }, "export { test };");
    });

    it("should remove the namespace export and module specifier when specifying", () => {
      doTest("export * from 'test';", { namedExports: [], moduleSpecifier: undefined }, "export { };");
    });

    it("should add the namespace export and set module specifier when specifying", () => {
      doTest("export {};", { namedExports: undefined, moduleSpecifier: "test" }, `export * from "test";`);
    });

    it("should add the namespace export when specifying", () => {
      doTest("export {};", { namespaceExport: "ns", moduleSpecifier: "test" }, `export * as ns from "test";`);
    });

    it("should set everything when specified", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<ExportDeclarationStructure>> = {
        isTypeOnly: true,
        namedExports: [{ name: "test" }, { name: "test2", alias: "alias" }],
        namespaceExport: undefined,
        moduleSpecifier: "asdf",
        assertElements: [{ name: "type", value: "test" }],
      };
      doTest(
        "export * from 'test';",
        structure,
        "export type { test, test2 as alias } from 'asdf' assert {\n    type: \"test\"\n};",
      );
    });

    function doThrowTest(text: string, structure: Partial<ExportDeclarationStructure>) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(() => firstChild.set(structure)).to.throw(errors.InvalidOperationError);
    }

    it("should throw when specifying no module specifier for a namespace export", () => {
      doThrowTest("export * from 'test';", { moduleSpecifier: undefined });
    });

    it("should throw when specifying a namespace export with no module specifier", () => {
      doThrowTest("export { } from 'test';", { namedExports: undefined, moduleSpecifier: undefined });
    });
  });

  describe(nameof<ExportDeclaration>("setAssertElements"), () => {
    function doTest(text: string, structure: OptionalKind<AssertEntryStructure>[] | undefined, expected: string) {
      const { firstChild, sourceFile } = getInfoFromText<ExportDeclaration>(text);
      firstChild.setAssertElements(structure);
      expect(sourceFile.getText()).to.equal(expected);
    }

    it("should add", () => {
      doTest(
        `export {} from "./test";`,
        [{ name: "type", value: "value" }],
        `export {} from "./test" assert {\n    type: "value"\n};`,
      );
    });

    it("should add when no semi-colon", () => {
      doTest(
        `export {} from "./test"`,
        [{ name: "type", value: "value" }],
        `export {} from "./test" assert {\n    type: "value"\n}`,
      );
    });

    it("should remove for undefined", () => {
      doTest(
        `export {} from "./test" assert { type: "value" };`,
        undefined,
        `export {} from "./test";`,
      );
    });

    it("should set", () => {
      doTest(
        `export {} from "./test" assert { something: "asdf" };`,
        [{ name: "type", value: "value" }, { name: "other", value: "test" }],
        `export {} from "./test" assert {\n    type: "value",\n    other: "test"\n};`,
      );
    });
  });

  describe(nameof<ExportDeclaration>("getStructure"), () => {
    function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<ExportDeclarationStructure>>) {
      const { firstChild } = getInfoFromText<ExportDeclaration>(text);
      expect(firstChild.getStructure()).to.deep.equal(expectedStructure);
    }

    it("should work with is type only", () => {
      doTest(`export type { } from "./test";`, {
        kind: StructureKind.ExportDeclaration,
        isTypeOnly: true,
        moduleSpecifier: "./test",
        namedExports: [],
        namespaceExport: undefined,
        assertElements: undefined,
      });
    });

    it("should work with named export declarations", () => {
      doTest(`export { name } from "./test";`, {
        kind: StructureKind.ExportDeclaration,
        isTypeOnly: false,
        moduleSpecifier: "./test",
        namedExports: [{ kind: StructureKind.ExportSpecifier, alias: undefined, name: "name" }],
        namespaceExport: undefined,
        assertElements: undefined,
      });
    });

    it("should work with namespace export declarations", () => {
      doTest(`export * from "./test" assert { type: 'asdf' };`, {
        kind: StructureKind.ExportDeclaration,
        isTypeOnly: false,
        moduleSpecifier: "./test",
        namedExports: [],
        namespaceExport: undefined,
        assertElements: [{ kind: StructureKind.AssertEntry, name: "type", value: "'asdf'" }],
      });
    });

    it("should work with namespace export declarations with a name", () => {
      doTest(`export * as ns from "./test";`, {
        kind: StructureKind.ExportDeclaration,
        isTypeOnly: false,
        moduleSpecifier: "./test",
        namedExports: [],
        namespaceExport: "ns",
        assertElements: undefined,
      });
    });
  });
});
