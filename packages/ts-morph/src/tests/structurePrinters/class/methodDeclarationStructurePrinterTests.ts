import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { FormatCodeSettings, Scope } from "../../../compiler";
import { MethodDeclarationStructurePrinter } from "../../../structurePrinters";
import { MethodDeclarationStructure, OptionalKind } from "../../../structures";
import { OptionalKindAndTrivia } from "../../compiler/testHelpers";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe("MethodDeclarationStructurePrinter", () => {
  interface Options {
    formatCodeSettings?: FormatCodeSettings;
    isAmbient?: boolean;
  }

  function doTest(structure: OptionalKind<MethodDeclarationStructure>, expectedOutput: string, options: Options = {}) {
    const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
    factory.forMethodDeclaration({ isAmbient: options.isAmbient || false }).printText(writer, structure);
    expect(writer.toString()).to.equal(expectedOutput);
  }

  describe(nameof<MethodDeclarationStructurePrinter>("printText"), () => {
    it("should write a method when the structure has public scope, hasQuestionToken: true, isStatic: true, isGenerator: true, and statements", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<MethodDeclarationStructure>> = {
        decorators: [{ name: "dec" }],
        docs: [{ description: "test" }],
        hasOverrideKeyword: false,
        hasQuestionToken: true,
        isAbstract: false,
        isAsync: false,
        isGenerator: true,
        isStatic: true,
        name: "method",
        overloads: [],
        parameters: [{ name: "p", type: "number" }],
        returnType: "IterableIterator<number>",
        scope: Scope.Public,
        statements: ["yield p;"],
        typeParameters: undefined,
      };

      doTest(
        structure,
        [
          "/** test */",
          "@dec",
          "public static *method?(p: number): IterableIterator<number> {\n    yield p;\n}",
        ].join("\n"),
      );
    });

    it("should write a method when the structure has isAsync: true, and statements", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<MethodDeclarationStructure>> = {
        decorators: [],
        docs: [],
        hasOverrideKeyword: false,
        hasQuestionToken: false,
        isAbstract: false,
        isAsync: true,
        isGenerator: false,
        isStatic: false,
        name: "method",
        overloads: [],
        parameters: [{ name: "p", type: "number" }],
        returnType: "Promise<number>",
        scope: undefined,
        statements: ["return Promise.resolve(p);"],
        typeParameters: undefined,
      };

      doTest(
        structure,
        [
          "async method(p: number): Promise<number> {\n    return Promise.resolve(p);\n}",
        ].join("\n"),
      );
    });

    it("should write a method when the structure has isAbstract: true", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<MethodDeclarationStructure>> = {
        decorators: [],
        docs: [],
        hasOverrideKeyword: false,
        hasQuestionToken: false,
        isAbstract: true,
        isAsync: false,
        isGenerator: false,
        isStatic: false,
        name: "method",
        overloads: [],
        parameters: [{ name: "p", type: "number" }],
        returnType: "number",
        scope: undefined,
        statements: ["return Promise.resolve(p);"],
        typeParameters: undefined,
      };

      doTest(
        structure,
        [
          "abstract method(p: number): number;",
        ].join("\n"),
      );
    });
  });
});
