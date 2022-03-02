import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { AssertEntry } from "../../../../compiler";
import { AssertEntryStructure } from "../../../../structures";
import { getInfoFromTextWithDescendant, OptionalKindAndTrivia } from "../../testHelpers";

describe("AssertEntry", () => {
  function getAssertEntry(text: string) {
    return getInfoFromTextWithDescendant<AssertEntry>(text, SyntaxKind.AssertEntry);
  }

  describe(nameof<AssertEntry>("set"), () => {
    function doTest(text: string, structure: Partial<AssertEntryStructure>, expectedText: string) {
      const { descendant, sourceFile } = getAssertEntry(text);
      descendant.set(structure);
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should set everything when specified", () => {
      const structure: OptionalKindAndTrivia<MakeRequired<AssertEntryStructure>> = {
        name: "test",
        value: "'asdf'",
      };
      doTest(
        "import * as a from 'test' assert { name: 'value' };",
        structure,
        "import * as a from 'test' assert { test: 'asdf' };",
      );
    });
  });
});
