import * as ts from "typescript";
import {expect} from "chai";
import {ObjectDestructuringAssignment} from "./../../../../compiler";
import {getInfoFromTextWithDescendant} from "./../../testHelpers";

describe(nameof(ObjectDestructuringAssignment), () => {
    describe(nameof<ObjectDestructuringAssignment>(n => n.getLeft), () => {
        function doTest(text: string, expectedText: string) {
            const {descendant} = getInfoFromTextWithDescendant<ObjectDestructuringAssignment>(text, ts.SyntaxKind.BinaryExpression);
            expect(descendant.getLeft().getText()).to.equal(expectedText);
        }

        it("should get the correct left side", () => {
            doTest("({x, y} = z);", "{x, y}");
        });
    });
});
