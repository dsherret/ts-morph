import { errors, nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ArrayBindingPattern, BindingElement } from "../../../../compiler";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../../testHelpers";

function getInfoFromTextWithBindingElement(text: string) {
  const info = getInfoFromTextWithDescendant<BindingElement>(text, SyntaxKind.BindingElement);
  return { ...info, bindingElement: info.descendant };
}

describe("BindingElement", () => {
  // tsgo parses the hole in `const [, a] = x` as a binding element with no name,
  // where the `typescript` package produced an OmittedExpression. Anything that
  // walks binding pattern elements looking for a name has to expect that.
  describe(nameof<BindingElement>("isElision"), () => {
    function getElements(text: string) {
      const { descendant } = getInfoFromTextWithDescendant<ArrayBindingPattern>(text, SyntaxKind.ArrayBindingPattern);
      return descendant.getElements();
    }

    it("should be an elision for the hole and not for the declared element", () => {
      const [hole, declared] = getElements("const [, a] = [1, 2];");
      expect(hole.isElision()).to.be.true;
      expect(declared.isElision()).to.be.false;
      expect(declared.getName()).to.equal("a");
    });

    it("should throw a useful error when asking an elision for its name", () => {
      const [hole] = getElements("const [, a] = [1, 2];");
      const message = "An elision in an array binding pattern has no name.";
      expect(() => hole.getNameNode()).to.throw(errors.InvalidOperationError, message);
      expect(() => hole.getName()).to.throw(errors.InvalidOperationError, message);
    });

    it("should skip an elision when looking a name up", () => {
      const { sourceFile } = getInfoFromText("const [, a] = [1, 2];\nfunction f([, b]: number[]) { return b; }");
      expect(sourceFile.getVariableDeclarationOrThrow("a").getName()).to.equal("[, a]");
      expect(sourceFile.getVariableDeclaration("nope")).to.be.undefined;
      expect(sourceFile.getFunctionOrThrow("f").getParameterOrThrow("b").getText()).to.equal("[, b]: number[]");
      expect(sourceFile.getFunctionOrThrow("f").getParameter("nope")).to.be.undefined;
    });
  });

  describe(nameof<BindingElement>("getName"), () => {
    function doTest(text: string, name: string) {
      const { bindingElement } = getInfoFromTextWithBindingElement(text);
      expect(bindingElement.getName()).to.equal(name);
    }

    it("should get the name", () => {
      doTest("const [v] = [];", "v");
    });

    it("should get the name when using spread syntax", () => {
      doTest("const [...v] = [];", "v");
    });

    it("should get the name when there's no property name", () => {
      doTest("const { a } = { a: 1 };", "a");
    });

    it("should get the name when there's a property name", () => {
      doTest("const { a: b } = { a: 1 };", "b");
    });
  });

  describe(nameof<BindingElement>("getDotDotDotTokenOrThrow"), () => {
    function doTest(text: string, shouldExist: boolean) {
      const { bindingElement } = getInfoFromTextWithBindingElement(text);
      if (shouldExist)
        expect(bindingElement.getDotDotDotTokenOrThrow().getText()).to.equal("...");
      else
        expect(() => bindingElement.getDotDotDotTokenOrThrow()).to.throw();
    }

    it("should get when it exists", () => {
      doTest("const [...v] = [];", true);
    });

    it("should return undefined when it doesn't exit", () => {
      doTest("const [v] = [];", false);
    });
  });

  describe(nameof<BindingElement>("getDotDotDotToken"), () => {
    function doTest(text: string, shouldExist: boolean) {
      const { bindingElement } = getInfoFromTextWithBindingElement(text);
      if (shouldExist)
        expect(bindingElement.getDotDotDotToken()!.getText()).to.equal("...");
      else
        expect(bindingElement.getDotDotDotToken()).to.be.undefined;
    }

    it("should get when it exists", () => {
      doTest("const [...v] = [];", true);
    });

    it("should return undefined when it doesn't exit", () => {
      doTest("const [v] = [];", false);
    });
  });

  describe(nameof<BindingElement>("getPropertyNameNodeOrThrow"), () => {
    function doTest(text: string, expectedName: string | undefined) {
      const { bindingElement } = getInfoFromTextWithBindingElement(text);
      if (expectedName == null)
        expect(() => bindingElement.getPropertyNameNodeOrThrow()).to.throw();
      else
        expect(bindingElement.getPropertyNameNodeOrThrow().getText()).to.equal(expectedName);
    }

    it("should get when it exists", () => {
      doTest("const { a: b } = { a: 1 };", "a");
    });

    it("should return undefined when it doesn't exit", () => {
      doTest("const { a } = { a: 1 };", undefined);
    });
  });

  describe(nameof<BindingElement>("getPropertyNameNode"), () => {
    function doTest(text: string, expectedName: string | undefined) {
      const { bindingElement } = getInfoFromTextWithBindingElement(text);
      expect(bindingElement.getPropertyNameNode()?.getText()).to.equal(expectedName);
    }

    it("should get when it exists", () => {
      doTest("const { a: b } = { a: 1 };", "a");
    });

    it("should return undefined when it doesn't exit", () => {
      doTest("const { a } = { a: 1 };", undefined);
    });
  });
});
