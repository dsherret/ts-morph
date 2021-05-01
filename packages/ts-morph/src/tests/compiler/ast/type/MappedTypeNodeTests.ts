import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { MappedTypeNode } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";


describe(nameof(MappedTypeNode), () => {
    function getNode(text: string) {
        return getInfoFromTextWithDescendant<MappedTypeNode>(text, SyntaxKind.MappedType);
    }

    describe(nameof<MappedTypeNode>(d => d.getNameTypeNode), () => {
        it("should get undefined where there's no name", () => {
            const { descendant } = getNode("type MappedExample<T> = { -readonly [Prop in keyof T]: T[Prop]; };");
            expect(descendant.getNameTypeNode()).to.be.undefined;
        });

        it("should get the name type node where there's a name", () => {
            const { descendant } = getNode("type Getters<Type> = {[Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]};");
            expect(descendant.getNameTypeNode()!.getText()).to.equal("`get${Capitalize<string & Property>}`");
        });
    });

    describe(nameof<MappedTypeNode>(d => d.getTypeParameter), () => {
        it("should get the name of the type parameter", () => {
            const { descendant } = getNode("type MappedExample<T> = { -readonly [Prop in keyof T]: T[Prop]; };");
            expect(descendant.getTypeParameter().getText()).to.equal("Prop in keyof T");
            expect(descendant.getTypeParameter().getConstraint()?.getText()).to.equal("keyof T");
        });
    });
});