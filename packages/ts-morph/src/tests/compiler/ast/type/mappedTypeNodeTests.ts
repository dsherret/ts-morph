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
            expect(() => descendant.getNameTypeNodeOrThrow()).to.throw();
        });

        it("should get the name type node where there's a name", () => {
            const { descendant } = getNode("type Getters<Type> = {[Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]};");
            expect(descendant.getNameTypeNode()!.getText()).to.equal("`get${Capitalize<string & Property>}`");
            expect(descendant.getNameTypeNodeOrThrow().getText()).to.equal("`get${Capitalize<string & Property>}`");
        });
    });

    describe(nameof<MappedTypeNode>(d => d.getTypeParameter), () => {
        it("should get the name of the type parameter", () => {
            const { descendant } = getNode("type MappedExample<T> = { -readonly [Prop in keyof T]: T[Prop]; };");
            expect(descendant.getTypeParameter().getText()).to.equal("Prop in keyof T");
            expect(descendant.getTypeParameter().getConstraint()?.getText()).to.equal("keyof T");
        });
    });

    describe(nameof<MappedTypeNode>(d => d.getTypeNode), () => {
        it("should get the type", () => {
            const { descendant } = getNode("type MappedExample<T> = { [Prop in keyof T]: T[Prop]; };");
            expect(descendant.getTypeNode()!.getText()).to.equal("T[Prop]");
            expect(descendant.getTypeNodeOrThrow().getText()).to.equal("T[Prop]");
        });

        it("should be undefined when not exists", () => {
            const { descendant } = getNode("type MappedExample<T> = { readonly [Prop in keyof T]; };");
            expect(descendant.getTypeNode()).to.be.undefined;
            expect(() => descendant.getTypeNodeOrThrow()).to.throw();
        });
    });

    describe(nameof<MappedTypeNode>(d => d.getReadonlyToken), () => {
        it("should get the readonly token", () => {
            const { descendant } = getNode("type MappedExample<T> = { -readonly [Prop in keyof T]?: T[Prop]; };");
            expect(descendant.getReadonlyToken()!.getText()).to.equal("-");
            expect(descendant.getReadonlyTokenOrThrow().getText()).to.equal("-");
        });

        it("should get the readonly token when it doesn't exist", () => {
            const { descendant } = getNode("type MappedExample<T> = { [Prop in keyof T]?: T[Prop]; };");
            expect(descendant.getReadonlyToken()).to.be.undefined;
            expect(() => descendant.getReadonlyTokenOrThrow()).to.throw();
        });
    });

    describe(nameof<MappedTypeNode>(d => d.getQuestionToken), () => {
        it("should get the readonly token", () => {
            const { descendant } = getNode("type MappedExample<T> = { -readonly [Prop in keyof T]?: T[Prop]; };");
            expect(descendant.getQuestionToken()!.getText()).to.equal("?");
            expect(descendant.getQuestionTokenOrThrow().getText()).to.equal("?");
        });

        it("should get the readonly token when it doesn't exist", () => {
            const { descendant } = getNode("type MappedExample<T> = { -readonly [Prop in keyof T]: T[Prop]; };");
            expect(descendant.getQuestionToken()).to.be.undefined;
            expect(() => descendant.getQuestionTokenOrThrow()).to.throw();
        });
    });
});
