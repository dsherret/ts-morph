import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #421", () => {
    it("should not remove a brace when adding a child to a namespace with dot notation", () => {
        const { sourceFile } = getInfoFromText("namespace Test.Test {\n}");

        const namespaceDec = sourceFile.getNamespaceOrThrow("Test.Test");
        namespaceDec.addEnum({ name: "Test" });

        expect(sourceFile.getFullText()).to.equal("namespace Test.Test {\n    enum Test {\n    }\n}");
    });
});
