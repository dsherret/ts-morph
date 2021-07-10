import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #450", () => {
    it("should get the type without the import", () => {
        const { sourceFile, project } = getInfoFromText("import { Class } from './Class'; let c: Class;");
        project.createSourceFile("Class.ts", "export class Class { prop: string; }");
        const varDec = sourceFile.getVariableDeclarationOrThrow("c");

        expect(varDec.getType().getText()).to.equal(`import("/Class").Class`);
        expect(varDec.getType().getText(varDec)).to.equal(`Class`);
    });
});
