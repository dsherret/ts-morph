import * as ts from "typescript";
import {expect} from "chai";
import {MetaProperty} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.MetaProperty)
    ) as MetaProperty;
    return {...obj, expression};
}

describe(nameof(MetaProperty), () => {
    describe(nameof<MetaProperty>(n => n.getKeywordToken), () => {
        function doTest(text: string, expectedText: ts.SyntaxKind) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getKeywordToken()).to.equal(expectedText);
        }

        it("should get the correct keyword token", () => {
            doTest("new.target", ts.SyntaxKind.NewKeyword);
        });
    });
});
