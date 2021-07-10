import { ClassDeclaration, PropertyDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

const code = `
export class Class {
    prop = "";

    constructor(param: Class) {
    }
}
`;

describe("tests for issue #53", () => {
    const { firstChild } = getInfoFromText<ClassDeclaration>(code);

    it("should set the type", () => {
        const prop = firstChild.getInstanceProperty("prop")! as PropertyDeclaration;
        prop.setType("string");
    });
});
