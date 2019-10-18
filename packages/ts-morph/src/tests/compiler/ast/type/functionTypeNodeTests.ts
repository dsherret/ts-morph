import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { FunctionTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe(nameof(FunctionTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<FunctionTypeNode>(text, SyntaxKind.FunctionType);
    }

    describe(nameof<FunctionTypeNode>(d => d.getReturnTypeNodeOrThrow), () => {
        it("should get the return type", () => {
            const { descendant } = getNode("var t: () => SomeClass;");
            expect(descendant.getReturnTypeNodeOrThrow().getText()).to.equal("SomeClass");
        });
    });

    describe(nameof<FunctionTypeNode>(d => d.setReturnType), () => {
        it("should set the return type", () => {
            const { descendant } = getNode("var t: () => SomeClass;");
            descendant.setReturnType("string");
            expect(descendant.getText()).to.equal("() => string");
        });
    });

    describe(nameof<FunctionTypeNode>(d => d.getParameters), () => {
        it("should get the parameters", () => {
            const { descendant } = getNode("var t: (param1, param2) => SomeClass;");
            expect(descendant.getParameters().map(p => p.getText())).to.deep.equal(["param1", "param2"]);
        });
    });

    describe(nameof<FunctionTypeNode>(d => d.addTypeParameter), () => {
        it("should add a type parameter when none exists", () => {
            const { descendant } = getNode("var t: () => SomeClass;");
            descendant.addTypeParameter({ name: "T" });
            expect(descendant.getText()).to.equal("<T>() => SomeClass");
        });
    });

    describe(nameof<FunctionTypeNode>(d => d.getTypeParameters), () => {
        it("should get the type parameters", () => {
            const { descendant } = getNode("var t: <T, U>(param1, param2) => SomeClass;");
            expect(descendant.getTypeParameters().map(p => p.getText())).to.deep.equal(["T", "U"]);
        });
    });
});
