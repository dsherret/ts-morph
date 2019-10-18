import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ThisTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(ThisTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ThisTypeNode>(text, SyntaxKind.ThisType);
    }

    it("should be able to get an instance of a ThisTypeNode", () => {
        const { descendant } = getNode("declare class Test { method(): this; }");
        expect(descendant).to.be.instanceOf(ThisTypeNode);
    });
});
