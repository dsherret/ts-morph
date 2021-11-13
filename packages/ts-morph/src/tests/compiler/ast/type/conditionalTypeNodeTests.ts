import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ConditionalTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("ConditionalTypeNode", () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ConditionalTypeNode>(text, SyntaxKind.ConditionalType);
    }
    const { descendant } = getNode("type Test<T> = CheckType extends ExtendsType ? TrueType : FalseType;");

    describe(nameof<ConditionalTypeNode>("getCheckType"), () => {
        it("should get the check type", () => {
            expect(descendant.getCheckType().getText()).to.equal("CheckType");
        });
    });

    describe(nameof<ConditionalTypeNode>("getExtendsType"), () => {
        it("should get the extends type", () => {
            expect(descendant.getExtendsType().getText()).to.equal("ExtendsType");
        });
    });

    describe(nameof<ConditionalTypeNode>("getTrueType"), () => {
        it("should get the true type", () => {
            expect(descendant.getTrueType().getText()).to.equal("TrueType");
        });
    });

    describe(nameof<ConditionalTypeNode>("getFalseType"), () => {
        it("should get the false type", () => {
            expect(descendant.getFalseType().getText()).to.equal("FalseType");
        });
    });
});
