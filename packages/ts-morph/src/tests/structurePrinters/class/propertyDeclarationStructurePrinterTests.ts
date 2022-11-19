import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { FormatCodeSettings, Scope } from "../../../compiler";
import { PropertyDeclarationStructurePrinter } from "../../../structurePrinters";
import { OptionalKind, PropertyDeclarationStructure } from "../../../structures";
import { OptionalKindAndTrivia } from "../../compiler/testHelpers";
import { getStructureFactoryAndWriter } from "../../testHelpers";

describe("PropertyDeclarationStructurePrinter", () => {
  interface Options {
    formatCodeSettings?: FormatCodeSettings;
    isAmbient?: boolean;
  }

  function doTest(structure: OptionalKind<PropertyDeclarationStructure>, expectedOutput: string, options: Options = {}) {
    const { writer, factory } = getStructureFactoryAndWriter(options.formatCodeSettings);
    factory.forPropertyDeclaration().printText(writer, structure);
    expect(writer.toString()).to.equal(expectedOutput);
  }

  // todo: more tests

  describe(nameof<PropertyDeclarationStructurePrinter>("printText"), () => {
    it("should write a property when the structure has everything", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<PropertyDeclarationStructure>> = {
        decorators: [{ name: "dec" }],
        docs: [{ description: "test" }],
        hasExclamationToken: false,
        hasAccessorKeyword: true,
        hasQuestionToken: true,
        hasDeclareKeyword: true,
        hasOverrideKeyword: true,
        initializer: "5",
        isAbstract: true,
        isReadonly: true,
        isStatic: true,
        name: "prop",
        scope: Scope.Public,
        type: "number",
      };

      doTest(
        structure,
        [
          "/** test */",
          "@dec",
          "declare public static override abstract readonly accessor prop?: number = 5;",
        ].join("\n"),
      );
    });
  });
});
