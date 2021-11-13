import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { AbstractableNode, ClassDeclaration } from "../../../../../compiler";
import { AbstractableNodeStructure } from "../../../../../structures";
import { getInfoFromText } from "../../../testHelpers";

describe("AbstractableNode", () => {
  describe(nameof<AbstractableNode>("getAbstractKeyword"), () => {
    it("should get the abstract keyword when abstract", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("abstract class Identifier {}");
      expect(firstChild.getAbstractKeyword()!.getText()).to.be.equal("abstract");
    });

    it("should return undefined when not abstract", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
      expect(firstChild.getAbstractKeyword()).to.be.undefined;
    });
  });

  describe(nameof<AbstractableNode>("getAbstractKeywordOrThrow"), () => {
    it("should get the abstract keyword when abstract", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("abstract class Identifier {}");
      expect(firstChild.getAbstractKeywordOrThrow().getText()).to.be.equal("abstract");
    });

    it("should throw when not abstract", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
      expect(() => firstChild.getAbstractKeywordOrThrow()).to.throw();
    });
  });

  describe(nameof<AbstractableNode>("isAbstract"), () => {
    it("should be abstract when abstract", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("abstract class Identifier {}");
      expect(firstChild.isAbstract()).to.be.true;
    });

    it("should be not abstract when not abstract", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
      expect(firstChild.isAbstract()).to.be.false;
    });
  });

  describe(nameof<AbstractableNode>("setIsAbstract"), () => {
    it("should be set to abstract", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
      firstChild.setIsAbstract(true);
      expect(firstChild.getText()).to.equal("abstract class Identifier {}");
    });

    it("should be set to not abstract", () => {
      const { firstChild } = getInfoFromText<ClassDeclaration>("abstract class Identifier {}");
      firstChild.setIsAbstract(false);
      expect(firstChild.getText()).to.equal("class Identifier {}");
    });
  });

  describe(nameof<ClassDeclaration>("set"), () => {
    function doTest(startingCode: string, structure: AbstractableNodeStructure, expectedCode: string) {
      const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startingCode);
      firstChild.set(structure);
      expect(firstChild.getText()).to.equal(expectedCode);
    }

    it("should not modify anything if the structure doesn't change anything", () => {
      doTest("class MyClass {}", {}, "class MyClass {}");
    });

    it("should not modify anything if the structure doesn't change anything and the node has everything set", () => {
      doTest("abstract class MyClass {}", {}, "abstract class MyClass {}");
    });

    it("should modify when setting as abstract", () => {
      doTest("class MyClass {}", { isAbstract: true }, "abstract class MyClass {}");
    });
  });
});
