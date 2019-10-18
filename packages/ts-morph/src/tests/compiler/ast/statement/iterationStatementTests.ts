import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ForInStatement, IterationStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<ForInStatement>(text, SyntaxKind.ForInStatement).descendant;
}

describe(nameof(IterationStatement), () => {
    const statement = "{}";
    const iterationStatement = `for (x in {}) ${statement}`;
    describe(nameof<IterationStatement>(n => n.getStatement), () => {
        function doTest(text: string, expectedText: string) {
            const forInStatement = getStatement(text);
            expect(forInStatement.getStatement().getText()).to.equal(expectedText);
        }

        it("should get the correct statement", () => {
            doTest(iterationStatement, statement);
        });
    });
});
