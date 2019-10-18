import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ArrayTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(ArrayTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ArrayTypeNode>(text, SyntaxKind.ArrayType);
    }

    describe(nameof<ArrayTypeNode>(d => d.getElementTypeNode), () => {
        it("should get the element type node", () => {
            const { descendant } = getNode("var t: string[]");
            expect(descendant.getElementTypeNode().getText()).to.equal("string");
        });
    });
});
