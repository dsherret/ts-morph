import * as ts from "typescript";
import {expect} from "chai";
import {LabeledStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithLabeledStatement(text: string) {
    const obj = getInfoFromText(text);
    const labeledStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.LabeledStatement)
    ) as LabeledStatement;
    return {...obj, labeledStatement};
}

describe(nameof(LabeledStatement), () => {
    const statement = "let x = 1 + 2";
    const label = "foo";
    const labeled = `${label}: ${statement}`;
    describe(nameof<LabeledStatement>(n => n.getLabel), () => {
        function doTest(text: string, expectedText: string) {
            const {labeledStatement} = getInfoFromTextWithLabeledStatement(text);
            expect(labeledStatement.getLabel().getText()).to.equal(expectedText);
        }

        it("should get the correct label", () => {
            doTest(labeled, label);
        });
    });

    describe(nameof<LabeledStatement>(n => n.getStatement), () => {
        function doTest(text: string, expectedText: string) {
            const {labeledStatement} = getInfoFromTextWithLabeledStatement(text);
            expect(labeledStatement.getStatement().getText()).to.equal(expectedText);
        }

        it("should get the correct statement", () => {
            doTest(labeled, statement);
        });
    });
});
