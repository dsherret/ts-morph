import { SyntaxKind, nameof } from "@ts-morph/common";
import { expect } from "chai";
import { ArrayDestructuringAssignment } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

describe("ArrayDestructuringAssignment", () => {
    describe(nameof.property<ArrayDestructuringAssignment>("getLeft"), () => {
        function doTest(text: string, expectedText: string) {
            const { descendant } = getInfoFromTextWithDescendant<ArrayDestructuringAssignment>(text, SyntaxKind.BinaryExpression);
            expect(descendant.getLeft().getText()).to.equal(expectedText);
        }

        it("should get the correct left side", () => {
            doTest("[x, y] = z;", "[x, y]");
        });
    });
});
