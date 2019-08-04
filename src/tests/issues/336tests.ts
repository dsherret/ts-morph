import { expect } from "chai";
import { FunctionDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #336", () => {
    it("should remove the interface up until the comment", () => {
        const text = `
type Foo = { foo: string; };
interface Foo {
  foo: string;
}

// foo
const foo = 1;`;
        const { sourceFile } = getInfoFromText<FunctionDeclaration>(text);
        sourceFile.getInterfaceOrThrow("Foo").remove();

        expect(sourceFile.getFullText()).to.equal(`
type Foo = { foo: string; };
// foo
const foo = 1;`);
    });
});
