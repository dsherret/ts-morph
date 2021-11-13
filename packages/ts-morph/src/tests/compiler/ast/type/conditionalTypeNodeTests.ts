import { SyntaxKind, nameof } from "@ts-morph/common";
import { expect } from "chai";
import { ConditionalTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("ConditionalTypeNode", () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ConditionalTypeNode>(text, SyntaxKind.ConditionalType);
    }
    const { descendant } = getNode("type Test<T> = CheckType extends ExtendsType ? TrueType : FalseType;");

    describe(nameof.property<ConditionalTypeNode>("getCheckType"), () => {
        it("should get the check type", () => {
            expect(descendant.getCheckType().getText()).to.equal("CheckType");
        });
    });

    describe(nameof.property<ConditionalTypeNode>("getExtendsType"), () => {
        it("should get the extends type", () => {
            expect(descendant.getExtendsType().getText()).to.equal("ExtendsType");
        });
    });

    describe(nameof.property<ConditionalTypeNode>("getTrueType"), () => {
        it("should get the true type", () => {
            expect(descendant.getTrueType().getText()).to.equal("TrueType");
        });
    });

    describe(nameof.property<ConditionalTypeNode>("getFalseType"), () => {
        it("should get the false type", () => {
            expect(descendant.getFalseType().getText()).to.equal("FalseType");
        });
    });
});
