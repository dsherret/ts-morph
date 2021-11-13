import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { LabeledStatement } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

function getStatement(text: string) {
    return getInfoFromTextWithDescendant<LabeledStatement>(text, SyntaxKind.LabeledStatement).descendant;
}

describe("LabeledStatement", () => {
    const statement = "let x = 1 + 2";
    const label = "foo";
    const labeled = `${label}: ${statement}`;

    describe(nameof.property<LabeledStatement>("getLabel"), () => {
        function doTest(text: string, expectedText: string) {
            const labeledStatement = getStatement(text);
            expect(labeledStatement.getLabel().getText()).to.equal(expectedText);
        }

        it("should get the correct label", () => {
            doTest(labeled, label);
        });
    });

    describe(nameof.property<LabeledStatement>("getStatement"), () => {
        function doTest(text: string, expectedText: string) {
            const labeledStatement = getStatement(text);
            expect(labeledStatement.getStatement().getText()).to.equal(expectedText);
        }

        it("should get the correct statement", () => {
            doTest(labeled, statement);
        });
    });
});
