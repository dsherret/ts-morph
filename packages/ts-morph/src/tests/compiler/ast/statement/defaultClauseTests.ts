import { SyntaxKind, nameof } from "@ts-morph/common";
import { expect } from "chai";
import { DefaultClause } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getDefaultClause(text: string) {
    return getInfoFromTextWithDescendant<DefaultClause>(text, SyntaxKind.DefaultClause).descendant;
}

describe("DefaultClause", () => {
    describe(nameof.property<DefaultClause>("getStatementsWithComments"), () => {
        function doTest(text: string, expectedTexts: string[]) {
            const defaultClause = getDefaultClause(text);
            expect(defaultClause.getStatementsWithComments().map(s => s.getText())).to.deep.equal(expectedTexts);
        }

        it("should get the correct statements", () => {
            doTest("switch (x) {\n  default:\n    let x = 1;\n    //a\n}", ["let x = 1;", "//a"]);
        });
    });
});
