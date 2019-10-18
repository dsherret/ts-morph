import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ConditionalTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(ConditionalTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ConditionalTypeNode>(text, SyntaxKind.ConditionalType);
    }
    const { descendant } = getNode("type Test<T> = CheckType extends ExtendsType ? TrueType : FalseType;");

    describe(nameof<ConditionalTypeNode>(n => n.getCheckType), () => {
        it("should get the check type", () => {
            expect(descendant.getCheckType().getText()).to.equal("CheckType");
        });
    });

    describe(nameof<ConditionalTypeNode>(n => n.getExtendsType), () => {
        it("should get the extends type", () => {
            expect(descendant.getExtendsType().getText()).to.equal("ExtendsType");
        });
    });

    describe(nameof<ConditionalTypeNode>(n => n.getTrueType), () => {
        it("should get the true type", () => {
            expect(descendant.getTrueType().getText()).to.equal("TrueType");
        });
    });

    describe(nameof<ConditionalTypeNode>(n => n.getFalseType), () => {
        it("should get the false type", () => {
            expect(descendant.getFalseType().getText()).to.equal("FalseType");
        });
    });
});
