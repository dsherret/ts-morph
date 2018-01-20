import * as ts from "typescript";
import {expect} from "chai";
import {MetaProperty} from "./../../../compiler";
import {getInfoFromTextWithDescendant} from "./../testHelpers";

describe(nameof(MetaProperty), () => {
    describe(nameof<MetaProperty>(n => n.getKeywordToken), () => {
        function doTest(text: string, expectedText: ts.SyntaxKind) {
            const {descendant} = getInfoFromTextWithDescendant<MetaProperty>(text, ts.SyntaxKind.MetaProperty);
            expect(descendant.getKeywordToken()).to.equal(expectedText);
        }

        it("should get the correct keyword token", () => {
            doTest("new.target", ts.SyntaxKind.NewKeyword);
        });
    });
});
