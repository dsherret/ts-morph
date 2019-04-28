import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { TypeGuards } from "../../utils";
import { getInfoFromText } from "../compiler/testHelpers";
import { Node, ClassDeclaration } from "../../compiler";

describe(nameof(TypeGuards), () => {
    // most of the code in TypeGuards is not worth the effort to test... it's auto generated from code so it should be close to correct

    describe(nameof(TypeGuards.hasExpression), () => {
        it("should have an expression when it's a function call", () => {
            const { firstChild } = getInfoFromText("funcCall()");
            expect(TypeGuards.hasExpression(firstChild)).to.be.true;
            if (TypeGuards.hasExpression(firstChild))
                expect(firstChild.getExpression().getText()).to.equal("funcCall()");
        });

        it("should not have an expression when it doesn't", () => {
            const { firstChild } = getInfoFromText("class Test {}");
            expect(TypeGuards.hasExpression(firstChild)).to.be.false;
        });

        it("should have an expression when it's a return statement with a value", () => {
            const { firstChild } = getInfoFromText("return 5;");
            expect(TypeGuards.hasExpression(firstChild)).to.be.true;
            if (TypeGuards.hasExpression(firstChild))
                expect(firstChild.getExpression().getText()).to.equal("5");
        });

        it("should not have an expression when it's a return statement without a value", () => {
            const { firstChild } = getInfoFromText("return;");
            expect(TypeGuards.hasExpression(firstChild)).to.be.false;
        });
    });

    describe(nameof(TypeGuards.hasName), () => {
        it("should have a name when it does", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class MyClass {}");
            expect(TypeGuards.hasName(firstChild)).to.be.true;
            if (TypeGuards.hasName(firstChild)) {
                assert<IsExact<typeof firstChild, ClassDeclaration & { getName(): string; getNameNode(): Node; }>>(true);
                expect(firstChild.getName()).to.equal("MyClass");
            }
        });

        it("should not have a name when it doesn't", () => {
            const { firstChild } = getInfoFromText("func()");
            expect(TypeGuards.hasName(firstChild)).to.be.false;
        });
    });

    describe(nameof(TypeGuards.isNode), () => {
        const { firstChild, project } = getInfoFromText("class MyClass {}");

        it("should get when it is", () => {
            expect(TypeGuards.isNode(firstChild)).to.be.true;
        });

        it("should get when it's not", () => {
            expect(TypeGuards.isNode(project)).to.be.false;
        });
    });
});
