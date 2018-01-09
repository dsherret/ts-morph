import * as ts from "typescript";
import {expect} from "chai";
import {ForOfStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithForOfStatement(text: string) {
    const obj = getInfoFromText(text);
    const forOfStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.ForOfStatement)
    ) as ForOfStatement;
    return {...obj, forOfStatement};
}

describe(nameof(ForOfStatement), () => {
    const expression = "{}";
    const initializer = "x";
    const statement = `for (${initializer} of ${expression}) {}`;
    describe(nameof<ForOfStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {forOfStatement} = getInfoFromTextWithForOfStatement(text);
            expect(forOfStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest(statement, expression);
        });
    });

    describe(nameof<ForOfStatement>(n => n.getInitializer), () => {
        function doTest(text: string, expectedText: string) {
            const {forOfStatement} = getInfoFromTextWithForOfStatement(text);
            expect(forOfStatement.getInitializer().getText()).to.equal(expectedText);
        }

        it("should get the correct initializer", () => {
            doTest(statement, initializer);
        });
    });

    describe(nameof<ForOfStatement>(n => n.fill), () => {
        it("should set await", () => {
            const {forOfStatement} = getInfoFromTextWithForOfStatement(statement);
            expect(forOfStatement.fill({ isAwaited: true }).getText()).to.equal(`for await (${initializer} of ${expression}) {}`);
        });
    });
});
