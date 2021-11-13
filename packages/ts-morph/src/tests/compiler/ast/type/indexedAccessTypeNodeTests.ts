import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { IndexedAccessTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("IndexedAccessTypeNode", () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<IndexedAccessTypeNode>(text, SyntaxKind.IndexedAccessType);
    }

    describe(nameof<IndexedAccessTypeNode>("getObjectTypeNode"), () => {
        it("should get the object type node", () => {
            const { descendant } = getNode("var t: MyObject['string']");
            expect(descendant.getObjectTypeNode().getText()).to.equal("MyObject");
        });
    });

    describe(nameof<IndexedAccessTypeNode>("getIndexTypeNode"), () => {
        it("should get the index type node", () => {
            const { descendant } = getNode("var t: MyObject['string']");
            expect(descendant.getIndexTypeNode().getText()).to.equal("'string'");
        });
    });
});
