import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ObjectDestructuringAssignment } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

describe("ObjectDestructuringAssignment", () => {
  describe(nameof<ObjectDestructuringAssignment>("getLeft"), () => {
    function doTest(text: string, expectedText: string) {
      const { descendant } = getInfoFromTextWithDescendant<ObjectDestructuringAssignment>(text, SyntaxKind.BinaryExpression);
      expect(descendant.getLeft().getText()).to.equal(expectedText);
    }

    it("should get the correct left side", () => {
      doTest("({x, y} = z);", "{x, y}");
    });
  });
});
