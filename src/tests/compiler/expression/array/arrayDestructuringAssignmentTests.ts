import * as ts from "typescript";
import {expect} from "chai";
import {ArrayDestructuringAssignment} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

function getInfoFromTextWithExpression(text: string) {
    const obj = getInfoFromText(text);
    const expression = (
        obj.sourceFile.getFirstDescendantByKindOrThrow(ts.SyntaxKind.BinaryExpression)
    ) as ArrayDestructuringAssignment;
    return {...obj, expression};
}

describe(nameof(ArrayDestructuringAssignment), () => {
    describe(nameof<ArrayDestructuringAssignment>(n => n.getLeft), () => {
        function doTest(text: string, expectedText: string) {
            const {expression} = getInfoFromTextWithExpression(text);
            expect(expression.getLeft().getText()).to.equal(expectedText);
        }

        it("should get the correct left side", () => {
            doTest("[x, y] = z;", "[x, y]");
        });
    });
});
