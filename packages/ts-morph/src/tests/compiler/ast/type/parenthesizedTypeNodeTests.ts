import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ParenthesizedTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(ParenthesizedTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ParenthesizedTypeNode>(text, SyntaxKind.ParenthesizedType);
    }

    describe(nameof<ParenthesizedTypeNode>(d => d.getType), () => {
        it("should get the type", () => {
            const { descendant } = getNode("var t: (string | number);");
            expect(descendant.getTypeNode().getText()).to.equal("string | number");
        });
    });

    describe(nameof<ParenthesizedTypeNode>(d => d.setType), () => {
        it("should set the type", () => {
            const { descendant, sourceFile } = getNode("var t: (string | number);");
            descendant.setType("number");
            expect(sourceFile.getFullText()).to.equal("var t: (number);");
        });
    });
});
