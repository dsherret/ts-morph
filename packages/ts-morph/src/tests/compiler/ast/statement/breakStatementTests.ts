import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { BreakStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getBreakStatement(text: string) {
    return getInfoFromTextWithDescendant<BreakStatement>(text, SyntaxKind.BreakStatement).descendant;
}

describe(nameof(BreakStatement), () => {
    const label = "foo";
    const statement = `break ${label};`;
    const emptyStatement = "break;";
    describe(nameof<BreakStatement>(n => n.getLabel), () => {
        function doTest(text: string, expectedText?: string) {
            const breakStatement = getBreakStatement(text);
            const value = breakStatement.getLabel();
            expect(value == null ? value : value.getText()).to.equal(expectedText);
        }

        it("should get the correct label", () => {
            doTest(statement, label);
        });

        it("should get the correct undefined label", () => {
            doTest(emptyStatement, undefined);
        });
    });

    describe(nameof<BreakStatement>(n => n.getLabelOrThrow), () => {
        function doTest(text: string, expectedText?: string) {
            const breakStatement = getBreakStatement(text);
            if (expectedText == null)
                expect(() => breakStatement.getLabelOrThrow()).to.throw();
            else
                expect(breakStatement.getLabelOrThrow().getText()).to.equal(expectedText);
        }

        it("should get the correct label", () => {
            doTest(statement, label);
        });

        it("should throw if label does not exist", () => {
            doTest(emptyStatement, undefined);
        });
    });
});
