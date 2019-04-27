import { expect } from "chai";
import { InferTypeNode } from "../../../../compiler";
import { SyntaxKind } from "../../../../typescript";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(InferTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<InferTypeNode>(text, SyntaxKind.InferType);
    }

    describe(nameof<InferTypeNode>(n => n.getTypeParameter), () => {
        it("should get the type parameter", () => {
            const { descendant } = getNode("type Return<T> = T extends (...args: any[]) => infer R ? R : any;");
            expect(descendant.getTypeParameter().getText()).to.equal("R");
        });
    });
});
