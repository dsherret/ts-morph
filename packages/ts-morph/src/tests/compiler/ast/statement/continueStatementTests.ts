import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ContinueStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<ContinueStatement>(text, SyntaxKind.ContinueStatement).descendant;
}

describe(nameof(ContinueStatement), () => {
    const label = "foo";
    const statement = `continue ${label};`;
    const emptyStatement = "continue;";

    describe(nameof<ContinueStatement>(n => n.getLabel), () => {
        function doTest(text: string, expectedText?: string) {
            const continueStatement = getStatement(text);
            const value = continueStatement.getLabel();
            expect(value?.getText()).to.equal(expectedText);
        }

        it("should get the correct label", () => {
            doTest(statement, label);
        });

        it("should get the correct undefined label", () => {
            doTest(emptyStatement, undefined);
        });
    });

    describe(nameof<ContinueStatement>(n => n.getLabelOrThrow), () => {
        function doTest(text: string, expectedText?: string) {
            const continueStatement = getStatement(text);
            if (expectedText == null)
                expect(() => continueStatement.getLabelOrThrow()).to.throw();
            else
                expect(continueStatement.getLabelOrThrow().getText()).to.equal(expectedText);
        }

        it("should get the correct label", () => {
            doTest(statement, label);
        });

        it("should throw if label does not exist", () => {
            doTest(emptyStatement, undefined);
        });
    });
});
