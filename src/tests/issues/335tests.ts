import { expect } from "chai";
import { FunctionDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #335", () => {
    it("should be able to add statements at a half indentation level", () => {
        const text = `
  function indentedF() {
  }
`;
        const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(text);
        firstChild.addStatements("return null;");

        expect(sourceFile.getFullText()).to.equal(`
  function indentedF() {
      return null;
  }
`);
    });
});
