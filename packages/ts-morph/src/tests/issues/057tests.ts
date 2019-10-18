import { expect } from "chai";
import { ClassDeclaration } from "../../compiler";
import { getInfoFromText } from "../compiler/testHelpers";

const code = `
export class Class {
    constructor(private param: Class) {
    }
}
`;

describe("tests for issue #57", () => {
    const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);

    it("should add the property", () => {
        firstChild.addProperty({
            isStatic: true,
            name: "prop",
            type: "string"
        });
        expect(sourceFile.getFullText()).to.equal(`
export class Class {
    constructor(private param: Class) {
    }

    static prop: string;
}
`);
    });
});
