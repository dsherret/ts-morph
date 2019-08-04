import { expect } from "chai";
import { ClassDeclaration, PropertyDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #90", () => {
    it("should be able to set modifiers when a decorator factory exists", () => {
        const text = `
class Identifier {
    private prop: string;
}`;
        const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
        (firstChild.getInstancePropertyOrThrow("prop") as PropertyDeclaration).addDecorator({
            name: "dec"
        });

        expect(sourceFile.getFullText()).to.equal(`
class Identifier {
    @dec
    private prop: string;
}`);
    });
});
