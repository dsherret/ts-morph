import {expect} from "chai";
import {EnumDeclaration, InitializerExpressionedNode, Expression} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(InitializerExpressionedNode), () => {
    function getEnumMemberFromText(text: string) {
        const {firstChild} = getInfoFromText<EnumDeclaration>(text);
        return firstChild.getMembers()[0];
    }

    function getMemberWithInitializer() {
        return getEnumMemberFromText("enum MyEnum {\n    myMember = 4\n}\n");
    }

    function getMemberWithoutInitializer() {
        return getEnumMemberFromText("enum MyEnum {\n    myMember\n}\n");
    }

    describe(nameof<InitializerExpressionedNode>(n => n.hasInitializer), () => {
        it("should have an initializer when it does", () => {
            expect(getMemberWithInitializer().hasInitializer()).to.be.true;
        });

        it("should not have an initializer when it doesn't", () => {
            expect(getMemberWithoutInitializer().hasInitializer()).to.be.false;
        });
    });

    describe(nameof<InitializerExpressionedNode>(n => n.getInitializer), () => {
        describe("having initializer", () => {
            const initializer = getMemberWithInitializer().getInitializer()!;

            it("should have correct text", () => {
                expect(initializer.getText()).to.equal("4");
            });

            it("should be of correct instance", () => {
                expect(initializer).to.be.instanceOf(Expression);
            });
        });

        describe("not having initializer", () => {
            it("should be undefined", () => {
                expect(getMemberWithoutInitializer().getInitializer()).to.be.undefined;
            });
        });
    });

    describe(nameof<InitializerExpressionedNode>(n => n.removeInitializer), () => {
        describe("having initializer", () => {
            const member = getMemberWithInitializer();
            const sourceFile = member.getRequiredSourceFile();
            it("should remove the initializer", () => {
                member.removeInitializer();
                expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    myMember\n}\n");
            });
        });

        describe("not having initializer", () => {
            const member = getMemberWithoutInitializer();
            const sourceFile = member.getRequiredSourceFile();
            it("should not remove the initializer because there isn't on", () => {
                member.removeInitializer();
                expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    myMember\n}\n");
            });
        });
    });

    describe(nameof<InitializerExpressionedNode>(n => n.setInitializer), () => {
        describe("having initializer", () => {
            const member = getMemberWithInitializer();
            const sourceFile = member.getRequiredSourceFile();
            it("should set the new initializer", () => {
                member.setInitializer("5");
                expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    myMember = 5\n}\n");
            });
        });

        describe("having initializer with comma", () => {
            const member = getEnumMemberFromText("enum MyEnum {\n    myMember = 4,\n}\n");
            const sourceFile = member.getRequiredSourceFile();
            it("should set the new initializer", () => {
                member.setInitializer("5");
                expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    myMember = 5,\n}\n");
            });
        });

        describe("having initializer and setting to empty string", () => {
            const member = getEnumMemberFromText("enum MyEnum {\n    myMember = 4,\n}\n");
            const sourceFile = member.getRequiredSourceFile();
            it("should remove the initializer", () => {
                expect(() => member.setInitializer("")).to.throw;
            });
        });

        describe("having initializer and setting to whitespace string", () => {
            const member = getEnumMemberFromText("enum MyEnum {\n    myMember = 4,\n}\n");
            const sourceFile = member.getRequiredSourceFile();
            it("should remove the initializer", () => {
                expect(() => member.setInitializer("    ")).to.throw;
            });
        });

        describe("having initializer and setting to null", () => {
            const member = getEnumMemberFromText("enum MyEnum {\n    myMember = 4,\n}\n");
            const sourceFile = member.getRequiredSourceFile();
            it("should throw", () => {
                expect(() => member.setInitializer(null as any)).to.throw;
            });
        });

        describe("having initializer and setting to a different type", () => {
            const member = getEnumMemberFromText("enum MyEnum {\n    myMember = 4,\n}\n");
            const sourceFile = member.getRequiredSourceFile();
            it("should throw", () => {
                expect(() => member.setInitializer(1 as any)).to.throw;
            });
        });

        describe("not having initializer", () => {
            const member = getMemberWithoutInitializer();
            const sourceFile = member.getRequiredSourceFile();
            it("should set the initializer", () => {
                member.setInitializer("5");
                expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    myMember = 5\n}\n");
            });
        });
    });
});
