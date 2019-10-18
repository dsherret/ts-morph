import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { WithStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<WithStatement>(text, SyntaxKind.WithStatement).descendant;
}

describe(nameof(WithStatement), () => {
    describe(nameof<WithStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const withStatement = getStatement(text);
            expect(withStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct statement", () => {
            doTest("with (Math) { PI; }", "Math");
        });
    });

    describe(nameof<WithStatement>(n => n.getStatement), () => {
        function doTest(text: string, expectedText: string) {
            const withStatement = getStatement(text);
            expect(withStatement.getStatement().getText()).to.equal(expectedText);
        }

        it("should get the correct statement", () => {
            doTest("with (Math) { PI; }", "{ PI; }");
        });
    });
});
