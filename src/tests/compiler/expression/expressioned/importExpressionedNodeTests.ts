import * as ts from "typescript";
import {expect} from "chai";
import {CallExpression, ImportExpressionedNode} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.CallExpression)
    ) as CallExpression;
    return {...obj, expression};
}

describe(nameof(ImportExpressionedNode), () => {
    describe(nameof<ImportExpressionedNode>(n => n.getExpression), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getExpression().getText()).to.equal(expectedText);
        }

        it("should get the correct expression", () => {
            doTest("import(x)", "import");
        });
    });
});
