import { expect } from "chai";
import { ClassDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #76", () => {
    it("should rename the class when there's a comment block above", () => {
        const text = `/**
 * Test
 */
class Identifier {
    /** Other text */
    prop: string;
}`;
        const { firstChild } = getInfoFromText<ClassDeclaration>(text);
        firstChild.rename("NewName");
        firstChild.getInstanceProperties()[0].rename("newPropName");
        expect(firstChild.getFullText()).to.equal(text.replace("Identifier", "NewName").replace("prop", "newPropName"));
    });
});
