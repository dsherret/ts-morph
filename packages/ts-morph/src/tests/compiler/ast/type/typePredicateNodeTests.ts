import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { TypePredicateNode } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(TypePredicateNode), () => {
    function getTypePredicateNode(text: string) {
        const { sourceFile } = getInfoFromText(text);
        return sourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.TypePredicate);
    }

    describe(nameof<TypePredicateNode>(n => n.getParameterNameNode), () => {
        it("should get", () => {
            expect(getTypePredicateNode("function test(asdf): asdf is string {}").getParameterNameNode().getText(), "asdf");
        });
    });

    describe(nameof<TypePredicateNode>(n => n.getTypeNode), () => {
        function doTest(text: string, expectedText: string | undefined) {
            const node = getTypePredicateNode(text).getTypeNode();
            expect(node?.getText()).to.equal(expectedText);
        }

        it("should get when exists", () => {
            doTest("function test(asdf): asdf is string {}", "string");
        });

        it("should not get when not exists", () => {
            doTest("function test(condition): asserts condition {}", undefined);
        });
    });

    describe(nameof<TypePredicateNode>(n => n.getTypeNodeOrThrow), () => {
        function doTest(text: string, expectedText: string | undefined) {
            const typePredicate = getTypePredicateNode(text);
            if (expectedText == null)
                expect(() => typePredicate.getTypeNodeOrThrow()).to.throw();
            else
                expect(typePredicate.getTypeNodeOrThrow().getText()).to.equal(expectedText);
        }

        it("should get when exists", () => {
            doTest("function test(asdf): asdf is string {}", "string");
        });

        it("should throw when not exists", () => {
            doTest("function test(condition): asserts condition {}", undefined);
        });
    });

    describe(nameof<TypePredicateNode>(n => n.hasAssertsModifier), () => {
        function doTest(text: string, expectedValue: boolean) {
            const typePredicate = getTypePredicateNode(text);
            expect(typePredicate.hasAssertsModifier()).to.equal(expectedValue);
        }

        it("should be true when has it", () => {
            doTest("function test(condition): asserts condition {}", true);
        });

        it("should be false when not", () => {
            doTest("function test(asdf): asdf is string {}", false);
        });
    });

    describe(nameof<TypePredicateNode>(n => n.getAssertsModifier), () => {
        function doTest(text: string, expectedValue: boolean) {
            const node = getTypePredicateNode(text).getAssertsModifier();
            expect(node?.getText()).to.equal(expectedValue ? "asserts" : undefined);
        }

        it("should get when has it", () => {
            doTest("function test(condition): asserts condition {}", true);
        });

        it("should not when not", () => {
            doTest("function test(asdf): asdf is string {}", false);
        });
    });

    describe(nameof<TypePredicateNode>(n => n.getAssertsModifierOrThrow), () => {
        function doTest(text: string, expectedValue: boolean) {
            const typePredicate = getTypePredicateNode(text);
            if (expectedValue)
                expect(typePredicate.getAssertsModifierOrThrow().getText()).to.equal("asserts");
            else
                expect(() => typePredicate.getAssertsModifierOrThrow()).to.throw();
        }

        it("should get when has it", () => {
            doTest("function test(condition): asserts condition {}", true);
        });

        it("should not when not", () => {
            doTest("function test(asdf): asdf is string {}", false);
        });
    });
});
