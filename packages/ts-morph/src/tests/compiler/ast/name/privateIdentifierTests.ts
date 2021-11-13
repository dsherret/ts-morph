import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { ClassDeclaration, PrivateIdentifier } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

function getInfoFromTextWithFirstProperty(text: string) {
  const obj = getInfoFromText<ClassDeclaration>(text);
  const firstProp = obj.firstChild.getProperties()[0];
  return { ...obj, firstProp };
}

describe("PrivateIdentifier", () => {
  describe(nameof<PrivateIdentifier>("getText"), () => {
    function doTest(text: string, expectedText: string) {
      const { firstProp } = getInfoFromTextWithFirstProperty(text);
      const identifier = (firstProp.getNameNode() as PrivateIdentifier);
      expect(identifier.getText()).to.equal(expectedText);
    }

    it("should get the correct text", () => {
      doTest("class C { #test; }", "#test");
    });
  });

  describe(nameof<PrivateIdentifier>("rename"), () => {
    function doTest(text: string, newName: string, expectedText: string) {
      const { sourceFile, firstProp } = getInfoFromTextWithFirstProperty(text);
      const identifier = (firstProp.getNameNode() as PrivateIdentifier);
      identifier.rename(newName);
      if (!newName.startsWith("#"))
        expect(identifier.wasForgotten()).to.be.true;
      expect(sourceFile.getFullText()).to.equal(expectedText);
    }

    it("should support renaming", () => {
      doTest("class C { #test; method() { this.#test = 4; } }", "#test2", "class C { #test2; method() { this.#test2 = 4; } }");
    });

    it("should support renaming to an identifier", () => {
      doTest("class C { #test; method() { this.#test = 4; } }", "test", "class C { test; method() { this.test = 4; } }");
    });
  });
});
