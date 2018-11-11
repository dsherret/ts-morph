import { expect } from "chai";
import { ClassDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #265", () => {
    it("should be able to handle getting static members when there exists a semicolon token", () => {
        const text = `
class Identifier {
    method() {};
}`;
        const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(text);
        expect(() => firstChild.getStaticMembers()).to.not.throw();
    });
});
