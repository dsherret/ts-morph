import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #424", () => {
    it("should insert with correct indentation when the file has a BOM at the beginning", () => {
        const { sourceFile } = getInfoFromText("\ufeffmodule Test {\n    enum Test {\n    }\n}");
        const enumDec = sourceFile.getNamespaceOrThrow("Test").getEnumOrThrow("Test");

        enumDec.addMember({ name: "member", initializer: "5" });

        expect(sourceFile.getFullText()).to.equal("module Test {\n    enum Test {\n        member = 5\n    }\n}");
    });
});
