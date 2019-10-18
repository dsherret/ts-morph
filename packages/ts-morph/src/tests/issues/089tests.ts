import { expect } from "chai";
import { ClassDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #89", () => {
    it("should be able to set modifiers when a decorator exists", () => {
        const text = `/** Description */
@dec
class Identifier {
}`;
        const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
        firstChild.setIsExported(true);
        expect(sourceFile.getFullText()).to.equal(`/** Description */
@dec
export class Identifier {
}`);
    });
});
