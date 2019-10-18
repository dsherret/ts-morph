import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TupleTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(TupleTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<TupleTypeNode>(text, SyntaxKind.TupleType);
    }

    describe(nameof<TupleTypeNode>(d => d.getElementTypeNodes), () => {
        it("should get the element type nodes of the tuple type node", () => {
            const { descendant } = getNode("var t: [string, number];");
            expect(descendant.getElementTypeNodes().map(t => t.getText())).to.deep.equal(["string", "number"]);
        });
    });
});
