import * as ts from "typescript";
import {expect} from "chai";
import {DefaultClause} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithDefaultClause(text: string) {
    const obj = getInfoFromText(text);
    const defaultClause = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.DefaultClause)
    ) as DefaultClause;
    return {...obj, defaultClause};
}

describe(nameof(DefaultClause), () => {
    const statement = "let x = 1 + 2;";
    const clause = `switch (x) { default: ${statement} }`;
    describe(nameof<DefaultClause>(n => n.getStatements), () => {
        function doTest(text: string, expectedText: string) {
            const {defaultClause} = getInfoFromTextWithDefaultClause(text);
            expect(defaultClause.getStatements()[0].getText()).to.equal(expectedText);
        }

        it("should get the correct statements", () => {
            doTest(clause, statement);
        });
    });
});
