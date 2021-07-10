import { expect } from "chai";
import { ClassDeclaration, PropertyDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #38", () => {
    it("should set the initializer when it's a string", () => {
        const text = `class Identifier {
    public static readonly Version: string = "1.0";
}`;
        const { firstChild } = getInfoFromText<ClassDeclaration>(text);
        const prop = firstChild.getStaticProperties()[0] as PropertyDeclaration;
        prop.setInitializer(`"2.0"`);
        expect(firstChild.getFullText()).to.equal(text.replace("1", "2"));
    });
});
