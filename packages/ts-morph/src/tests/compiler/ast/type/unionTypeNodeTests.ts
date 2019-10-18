import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { UnionTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(UnionTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<UnionTypeNode>(text, SyntaxKind.UnionType);
    }

    describe(nameof<UnionTypeNode>(d => d.getTypeNodes), () => {
        it("should get the type nodes of the union type nodes", () => {
            const { descendant } = getNode("var t: string | number");
            expect(descendant.getTypeNodes().map(t => t.getText())).to.deep.equal(["string", "number"]);
        });
    });
});
