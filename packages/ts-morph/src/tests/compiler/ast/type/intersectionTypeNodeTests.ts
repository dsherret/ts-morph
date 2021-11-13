import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { IntersectionTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("IntersectionTypeNode", () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<IntersectionTypeNode>(text, SyntaxKind.IntersectionType);
    }

    describe(nameof<IntersectionTypeNode>("getTypeNodes"), () => {
        it("should get the type nodes of the intersection type node", () => {
            const { descendant } = getNode("var t: string & number");
            expect(descendant.getTypeNodes().map(t => t.getText())).to.deep.equal(["string", "number"]);
        });
    });
});
