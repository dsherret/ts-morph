import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #189", () => {
    it("should keep the comment at the beginning of the file", () => {
        const { sourceFile } = getInfoFromText("");
        sourceFile.addStatements("/* test */");
        sourceFile.addVariableStatement({ declarations: [{ name: "v" }] });
        sourceFile.addImportDeclaration({ moduleSpecifier: "test" });
        expect(sourceFile.getFullText()).to.deep.equal(`/* test */\nimport "test";\n\nlet v;\n`);
    });
});
