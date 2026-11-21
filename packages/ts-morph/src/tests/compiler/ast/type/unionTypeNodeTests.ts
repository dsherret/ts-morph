import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { UnionTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("UnionTypeNode", () => {
  function getNode(text: string) {
    return getInfoFromTextWithDescendant<UnionTypeNode>(text, SyntaxKind.UnionType);
  }

  describe(nameof<UnionTypeNode>("getTypeNodes"), () => {
    it("should get the type nodes of the union type nodes", () => {
      const { descendant } = getNode("var t: string | number");
      expect(descendant.getTypeNodes().map(t => t.getText())).to.deep.equal(["string", "number"]);
    });
  });

  describe(nameof<UnionTypeNode>("getChildSyntaxList"), () => {
    function doTest(text: string, expectedChildren: string[]) {
      const { descendant } = getNode(text);
      const syntaxList = descendant.getChildSyntaxList();
      expect(syntaxList).to.equal(descendant.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList));
      expect(syntaxList!.getChildren().map(child => child.getText())).to.deep.equal(expectedChildren);
      expect(syntaxList!.getParent()).to.equal(descendant);
    }

    it("should get the syntax list of a union type", () => {
      doTest("const a: string | undefined;", ["string", "|", "undefined"]);
    });

    it("should get the syntax list with a leading pipe", () => {
      doTest("type T = | string | number;", ["|", "string", "|", "number"]);
    });

    it("should get the syntax list of a single type with a leading pipe", () => {
      doTest("type T = | string;", ["|", "string"]);
    });

    it("should get all types with comments and newlines", () => {
      doTest("type T = string /* first */\n | number\n | undefined;", ["string", "|", "number", "|", "undefined"]);
    });

    it("should get the union's syntax list instead of a type literal's syntax list", () => {
      doTest("type T = { value: string } | { value: number };", ["{ value: string }", "|", "{ value: number }"]);
    });

    it("should get the outer union's syntax list when a type contains a union", () => {
      doTest("type T = (string | number) | undefined;", ["(string | number)", "|", "undefined"]);
    });
  });

  describe(nameof<UnionTypeNode>("getChildSyntaxListOrThrow"), () => {
    it("should get the union type's syntax list without throwing", () => {
      const { descendant } = getNode("const a: string | undefined;");
      expect(descendant.getChildSyntaxListOrThrow()).to.equal(descendant.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList));
    });
  });
});
