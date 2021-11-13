import { nameof } from "@ts-morph/common";
import { expect } from "chai";
import { assert, IsExact } from "conditional-type-checks";
import { ClassDeclaration, ExpressionStatement, Node } from "../../../../compiler";
import { Structures } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe("Node", () => {
    // most of the type guards are not worth the effort to test... it's auto generated from code so it should be close to correct

    describe(nameof(Node, "hasExpression"), () => {
        it("should have an expression when it's a function call", () => {
            const { firstChild } = getInfoFromText("funcCall()");
            expect(Node.hasExpression(firstChild)).to.be.true;
            if (Node.hasExpression(firstChild))
                expect(firstChild.getExpression().getText()).to.equal("funcCall()");
        });

        it("should not have an expression when it doesn't", () => {
            const { firstChild } = getInfoFromText("class Test {}");
            expect(Node.hasExpression(firstChild)).to.be.false;
        });

        it("should have an expression when it's a return statement with a value", () => {
            const { firstChild } = getInfoFromText("return 5;");
            expect(Node.hasExpression(firstChild)).to.be.true;
            if (Node.hasExpression(firstChild))
                expect(firstChild.getExpression().getText()).to.equal("5");
        });

        it("should not have an expression when it's a return statement without a value", () => {
            const { firstChild } = getInfoFromText("return;");
            expect(Node.hasExpression(firstChild)).to.be.false;
        });
    });

    describe(nameof(Node, "hasName"), () => {
        it("should have a name when it does", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class MyClass {}");
            expect(Node.hasName(firstChild)).to.be.true;
            if (Node.hasName(firstChild)) {
                assert<IsExact<typeof firstChild, ClassDeclaration & { getName(): string; getNameNode(): Node; }>>(true);
                expect(firstChild.getName()).to.equal("MyClass");
            }
        });

        it("should not have a name when it doesn't", () => {
            const { firstChild } = getInfoFromText("func()");
            expect(Node.hasName(firstChild)).to.be.false;
        });
    });

    describe(nameof(Node, "hasStructure"), () => {
        it("should have a structure when it does", () => {
            const { firstChild } = getInfoFromText<Node>("class MyClass {}");
            expect(Node.hasName(firstChild)).to.be.true;
            if (Node.hasStructure(firstChild)) {
                assert<IsExact<typeof firstChild, Node & { getStructure(): Structures; }>>(true);
                expect((firstChild.getStructure() as any).name).to.equal("MyClass");
            }
        });

        it("should not have a structure when it doesn't", () => {
            const { firstChild } = getInfoFromText<ExpressionStatement>("func();");
            expect(Node.hasStructure(firstChild.getExpression().getChildren()[0])).to.be.false;
        });
    });

    describe(nameof(Node, "isNode"), () => {
        const { firstChild, project } = getInfoFromText("class MyClass {}");

        it("should get when it is", () => {
            expect(Node.isNode(firstChild)).to.be.true;
        });

        it("should get when it's not", () => {
            expect(Node.isNode(project)).to.be.false;
        });
    });
});
