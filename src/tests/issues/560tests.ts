import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #560", () => {
    it("should get declarations of import", () => {
        const { sourceFile } = getInfoFromText("enum Color { Red, Green, Blue }\nexport class LoginRequest { color: Color; }");
        const prop = sourceFile.getClassOrThrow("LoginRequest").getPropertyOrThrow("color");
        expect(prop.getType().isEnum()).to.be.true;
    });
});
