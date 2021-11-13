import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ArrayTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("ArrayTypeNode", () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ArrayTypeNode>(text, SyntaxKind.ArrayType);
    }

    describe(nameof<ArrayTypeNode>("getElementTypeNode"), () => {
        it("should get the element type node", () => {
            const { descendant } = getNode("var t: string[]");
            expect(descendant.getElementTypeNode().getText()).to.equal("string");
        });
    });
});
