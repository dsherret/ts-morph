import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { CommentTypeElement, InterfaceDeclaration } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("CommentTypeElement", () => {
  describe(nameof<CommentTypeElement>("remove"), () => {
    it("should remove the comment", () => {
      const { firstChild } = getInfoFromText<InterfaceDeclaration>("interface I {\n    // test\n}");
      firstChild.getMembersWithComments()[0].remove();
      expect(firstChild.getText()).to.equal("interface I {\n}");
    });
  });
});
