import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { NamedImports, Node } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("NamedImports", () => {
  function getInfo(text: string) {
    const info = getInfoFromText(text);
    return {
      descendant: info.sourceFile.getFirstDescendantOrThrow(Node.isNamedImports),
      ...info,
    };
  }

  describe(nameof<NamedImports>("getElements"), () => {
    function doTest(text: string, elements: string[]) {
      const { descendant } = getInfo(text);
      expect(descendant.getElements().map(e => e.getText())).to.deep.equal(elements);
    }

    it("should get", () => {
      doTest("import { Test, Test2 } from 'test'", ["Test", "Test2"]);
    });
  });
});
