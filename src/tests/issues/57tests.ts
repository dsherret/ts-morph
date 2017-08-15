import {expect} from "chai";
import {ClassDeclaration, PropertyDeclaration} from "./../../compiler";
import {getInfoFromText} from "./../compiler/testHelpers";

const code = `
export class Class {
    constructor(private param: Class) {
    }
}
`;

describe("tests for issue #57", () => {
    const {firstChild} = getInfoFromText<ClassDeclaration>(code);

    it("should add the property", () => {
        firstChild.addProperty({
            isStatic: true,
            name: "prop",
            type: "string"
        });
    });
});
