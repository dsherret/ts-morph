import { expect } from "chai";
import { DefaultClause } from "../../../compiler";
import { SyntaxKind } from "../../../typescript";
import { getInfoFromTextWithDescendant } from "../testHelpers";

function getDefaultClause(text: string) {
    return getInfoFromTextWithDescendant<DefaultClause>(text, SyntaxKind.DefaultClause).descendant;
}

describe(nameof(DefaultClause), () => {
    const statement = "let x = 1 + 2;";
    const clause = `switch (x) { default: ${statement} }`;
    describe(nameof<DefaultClause>(n => n.getStatements), () => {
        function doTest(text: string, expectedText: string) {
            const defaultClause = getDefaultClause(text);
            expect(defaultClause.getStatements()[0].getText()).to.equal(expectedText);
        }

        it("should get the correct statements", () => {
            doTest(clause, statement);
        });
    });
});
