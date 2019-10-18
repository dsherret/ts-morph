import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { EnumDeclaration, Expression, InitializerExpressionGetableNode } from "../../../../../compiler";
import { getInfoFromText } from "../../../testHelpers";

describe(nameof(InitializerExpressionGetableNode), () => {
    function getEnumMemberFromText(text: string) {
        const result = getInfoFromText<EnumDeclaration>(text);
        return { member: result.firstChild.getMembers()[0], ...result };
    }

    describe(nameof<InitializerExpressionGetableNode>(n => n.hasInitializer), () => {
        function doTest(code: string, expectedResult: boolean) {
            const { member } = getEnumMemberFromText(code);
            expect(member.hasInitializer()).to.equal(expectedResult);
        }

        it("should have an initializer when it does", () => {
            doTest("enum MyEnum { myMember = 4 }", true);
        });

        it("should not have an initializer when it doesn't", () => {
            doTest("enum MyEnum { myMember }", false);
        });
    });

    describe(nameof<InitializerExpressionGetableNode>(n => n.getInitializer), () => {
        describe("having initializer", () => {
            const { member } = getEnumMemberFromText("enum MyEnum { myMember = 4 }");
            const initializer = member.getInitializer()!;

            it("should have correct text", () => {
                expect(initializer.getText()).to.equal("4");
            });

            it("should be of correct instance", () => {
                expect(initializer).to.be.instanceOf(Expression);
            });
        });

        describe("not having initializer", () => {
            it("should be undefined", () => {
                const { member } = getEnumMemberFromText("enum MyEnum { myMember }");
                expect(member.getInitializer()).to.be.undefined;
            });
        });
    });

    describe(nameof<InitializerExpressionGetableNode>(n => n.getInitializerOrThrow), () => {
        it("should get when the initializer exists", () => {
            const { member } = getEnumMemberFromText("enum MyEnum { myMember = 4 }");
            expect(member.getInitializerOrThrow().getText()).to.equal("4");
        });

        it("should throw when the initializer doesn't exist", () => {
            const { member } = getEnumMemberFromText("enum MyEnum { myMember }");
            expect(() => member.getInitializerOrThrow()).to.throw();
        });
    });

    describe(nameof<InitializerExpressionGetableNode>(n => n.getInitializerIfKind), () => {
        it("should get when the initializer of kind exists", () => {
            const { member } = getEnumMemberFromText("enum MyEnum { myMember = 4 }");
            expect(member.getInitializerIfKind(SyntaxKind.NumericLiteral)!.getText()).to.equal("4");
        });

        it("should be undefined when the initializer of kind does not exists", () => {
            const { member } = getEnumMemberFromText("enum MyEnum { myMember = 4 }");
            expect(member.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)).to.be.undefined;
        });

        it("should be undefined when the initializer doesn't exist", () => {
            const { member } = getEnumMemberFromText("enum MyEnum { myMember }");
            expect(member.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression)).to.be.undefined;
        });
    });

    describe(nameof<InitializerExpressionGetableNode>(n => n.getInitializerIfKindOrThrow), () => {
        it("should get when the initializer of kind exists", () => {
            const { member } = getEnumMemberFromText("enum MyEnum { myMember = 4 }");
            expect(member.getInitializerIfKindOrThrow(SyntaxKind.NumericLiteral).getText()).to.equal("4");
        });

        it("should throw when the initializer of kind does not exists", () => {
            const { member } = getEnumMemberFromText("enum MyEnum { myMember = 4 }");
            expect(() => member.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)).to.throw();
        });

        it("should be undefined when the initializer doesn't exist", () => {
            const { member } = getEnumMemberFromText("enum MyEnum { myMember }");
            expect(() => member.getInitializerIfKindOrThrow(SyntaxKind.ObjectLiteralExpression)).to.throw();
        });
    });
});
