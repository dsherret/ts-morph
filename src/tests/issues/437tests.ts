import { expect } from "chai";
import { SyntaxKind } from "../../typescript";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #437", () => {
    it("should not return undefined for findReferencesAsNodes", () => {
        const { sourceFile } = getInfoFromText("const f: { a: string; } = {a: '23'}; f['a'];");
        const varDec = sourceFile.getVariableDeclarationOrThrow("f");
        const results = varDec.getFirstDescendantByKindOrThrow(SyntaxKind.PropertySignature).findReferencesAsNodes();

        expect(results.map(r => r.getText())).to.deep.equal(["a", "'a'"]);
    });
});
