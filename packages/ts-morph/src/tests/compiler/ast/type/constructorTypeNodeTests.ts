import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ConstructorTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(ConstructorTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<ConstructorTypeNode>(text, SyntaxKind.ConstructorType);
    }

    describe(nameof<ConstructorTypeNode>(d => d.getReturnTypeNodeOrThrow), () => {
        it("should get the return type", () => {
            const { descendant } = getNode("var t: new() => SomeClass;");
            expect(descendant.getReturnTypeNodeOrThrow().getText()).to.equal("SomeClass");
        });
    });

    describe(nameof<ConstructorTypeNode>(d => d.getParameters), () => {
        it("should get the parameters", () => {
            const { descendant } = getNode("var t: new(param1, param2) => SomeClass;");
            expect(descendant.getParameters().map(p => p.getText())).to.deep.equal(["param1", "param2"]);
        });
    });
});
