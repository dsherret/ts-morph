import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { InferTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("InferTypeNode", () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<InferTypeNode>(text, SyntaxKind.InferType);
    }

    describe(nameof<InferTypeNode>("getTypeParameter"), () => {
        it("should get the type parameter", () => {
            const { descendant } = getNode("type Return<T> = T extends (...args: any[]) => infer R ? R : any;");
            expect(descendant.getTypeParameter().getText()).to.equal("R");
        });
    });
});
