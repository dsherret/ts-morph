import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { NamedExports, Node } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("NamedExports", () => {
  function getInfo(text: string) {
    const info = getInfoFromText(text);
    return {
      descendant: info.sourceFile.getFirstDescendantOrThrow(Node.isNamedExports),
      ...info,
    };
  }

  describe(nameof<NamedExports>("getElements"), () => {
    function doTest(text: string, elements: string[]) {
      const { descendant } = getInfo(text);
      expect(descendant.getElements().map(e => e.getText())).to.deep.equal(elements);
    }

    it("should get", () => {
      doTest("export { Test, Test2 } from 'test'", ["Test", "Test2"]);
    });
  });
});
