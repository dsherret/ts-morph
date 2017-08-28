import * as ts from "typescript";
import {expect} from "chai";
import {ArrayLiteralExpression, VariableStatement} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ArrayLiteralExpression), () => {
    function getArrayLiteralExpression(text: string) {
        const opts = getInfoFromText<VariableStatement>(text);
        const declaration = opts.firstChild.getDeclarationList().getDeclarations()[0];
        return {
            arrayLiteralExpression: declaration.getFirstChildByKindOrThrow(ts.SyntaxKind.ArrayLiteralExpression) as ArrayLiteralExpression,
            ...opts
        };
    }

    describe(nameof<ArrayLiteralExpression>(e => e.getElements), () => {
        function doTest(text: string, elementTexts: string[]) {
            const {arrayLiteralExpression} = getArrayLiteralExpression(text);
            expect(arrayLiteralExpression.getElements().map(e => e.getText())).to.deep.equal(elementTexts);
        }

        it("should get the elements when there are none", () => {
            doTest("var t = []", []);
        });

        it("should get the elements when there are some", () => {
            doTest("var t = [5, 3, 'test']", ["5", "3", "'test'"]);
        });
    });
});
