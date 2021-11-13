import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ForInStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<ForInStatement>(text, SyntaxKind.ForInStatement).descendant;
}

describe("ForInStatement", () => {
    const expression = "{}";
    const initializer = "x";
    const statement = `for (${initializer} in ${expression}) {}`;

    describe(nameof.property<ForInStatement>("getExpression"), () => {
        function doTest(text: string, expectedText: string) {
            const forInStatement = getStatement(text);
            expect(forInStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });

    describe(nameof.property<ForInStatement>("getInitializer"), () => {
        function doTest(text: string, expectedText: string) {
            const forInStatement = getStatement(text);
            expect(forInStatement.getInitializer().getText()).to.equal(expectedText);
        }

        it("should get the correct initializer", () => {
            doTest(statement, initializer);
        });
    });
});
