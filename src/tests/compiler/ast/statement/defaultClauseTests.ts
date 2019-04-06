import { expect } from "chai";
import { DefaultClause } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getDefaultClause(text: string) {
    return getInfoFromTextWithDescendant<DefaultClause>(text, SyntaxKind.DefaultClause).descendant;
}

describe(nameof(DefaultClause), () => {
    describe(nameof<DefaultClause>(n => n.getStatements), () => {
        function doTest(text: string, expectedTexts: string[]) {
            const defaultClause = getDefaultClause(text);
            expect(defaultClause.getStatements().map(s => s.getText())).to.deep.equal(expectedTexts);
        }

        it("should get the correct statements", () => {
            doTest("switch (x) {\n  default:\n    let x = 1;\n    //a\n}", ["let x = 1;", "//a"]);
        });
    });
});
