import * as ts from "typescript";
import {expect} from "chai";
import {WithStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithForInStatement(text: string) {
    const obj = getInfoFromText(text);
    const withStatement = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.WithStatement)
    ) as WithStatement;
    return {...obj, withStatement};
}

describe(nameof(WithStatement), () => {
    describe(nameof<WithStatement>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {withStatement} = getInfoFromTextWithForInStatement(text);
            expect(withStatement.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct statement", () => {
            doTest("with (Math) { PI; }", "Math");
        });
    });

    describe(nameof<WithStatement>(n => n.getStatement), () => {
        function doTest(text: string, expectedText: string) {
            const {withStatement} = getInfoFromTextWithForInStatement(text);
            expect(withStatement.getStatement().getText()).to.equal(expectedText);
        }

        it("should get the correct statement", () => {
            doTest("with (Math) { PI; }", "{ PI; }");
        });
    });
});
