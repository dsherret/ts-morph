import {expect} from "chai";
import {EnumDeclaration, InitializerExpressionableNode, Expression, ClassDeclaration, PropertyDeclaration} from "./../../../../compiler";
import {InitializerExpressionableNodeStructure} from "./../../../../structures";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(InitializerExpressionableNode), () => {
    function getEnumMemberFromText(text: string) {
        const result = getInfoFromText<EnumDeclaration>(text);
        return { member: result.firstChild.getMembers()[0], ...result };
    }

    describe(nameof<InitializerExpressionableNode>(n => n.hasInitializer), () => {
        function doTest(code: string, expectedResult: boolean) {
            const {member} = getEnumMemberFromText(code);
            expect(member.hasInitializer()).to.equal(expectedResult);
        }

        it("should have an initializer when it does", () => {
            doTest("enum MyEnum { myMember = 4 }", true);
        });

        it("should not have an initializer when it doesn't", () => {
            doTest("enum MyEnum { myMember }", false);
        });
    });

    describe(nameof<InitializerExpressionableNode>(n => n.getInitializer), () => {
        describe("having initializer", () => {
            const {member} = getEnumMemberFromText("enum MyEnum { myMember = 4 }");
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
                const {member} = getEnumMemberFromText("enum MyEnum { myMember }");
                expect(member.getInitializer()).to.be.undefined;
            });
        });
    });

    describe(nameof<InitializerExpressionableNode>(n => n.removeInitializer), () => {
        function doTest(startCode: string, expectedCode: string) {
            const {member, sourceFile} = getEnumMemberFromText(startCode);
            member.removeInitializer();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove when it has an initializer", () => {
            doTest("enum MyEnum { myMember = 5 }", "enum MyEnum { myMember }");
        });

        it("should do nothing when it doesn't have an initializer", () => {
            doTest("enum MyEnum { myMember }", "enum MyEnum { myMember }");
        });
    });

    describe(nameof<InitializerExpressionableNode>(n => n.setInitializer), () => {
        describe("enum member", () => {
            function doThrowTest(initializerText: any) {
                const {member} = getEnumMemberFromText("enum MyEnum {\n    myMember = 4,\n}\n");
                expect(() => member.setInitializer(initializerText)).to.throw();
            }

            function doEnumMemberTest(startCode: string, initializer: string, expectedCode: string) {
                const {member, sourceFile} = getEnumMemberFromText(startCode);
                member.setInitializer(initializer);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should set the new initializer when it has one already", () => {
                doEnumMemberTest("enum MyEnum {\n    myMember = 4\n}\n", "5", "enum MyEnum {\n    myMember = 5\n}\n");
            });

            it("should set the new initializer when it has one and there's a comma", () => {
                doEnumMemberTest("enum MyEnum {\n    myMember = 4,\n}\n", "5", "enum MyEnum {\n    myMember = 5,\n}\n");
            });

            describe("having initializer and setting to empty string", () => {
                doThrowTest("");
            });

            describe("having initializer and setting to whitespace string", () => {
                doThrowTest("    ");
            });

            describe("having initializer and setting to null", () => {
                doThrowTest(null);
            });

            describe("having initializer and setting to a different type", () => {
                doThrowTest(1);
            });

            it("should set the initializer when it doens't have one", () => {
                doEnumMemberTest("enum MyEnum {\n    myMember\n}\n", "5", "enum MyEnum {\n    myMember = 5\n}\n");
            });
        });

        describe("class property", () => {
            function doClassPropTest(text: string, newInitializer: string, expected: string) {
                const {firstChild} = getInfoFromText<ClassDeclaration>(text);
                const prop = firstChild.getInstanceProperties()[0] as PropertyDeclaration;
                prop.setInitializer(newInitializer);
                expect(firstChild.getFullText()).to.equal(expected);
            }

            it("should set a new initializer", () => {
                doClassPropTest("class Identifier { prop; }", "2", "class Identifier { prop = 2; }");
            });

            it("should replace initializer", () => {
                doClassPropTest("class Identifier { prop = '2'; }", "2", "class Identifier { prop = 2; }");
            });

            it("should replace initializer that is an object", () => {
                doClassPropTest("class Identifier { prop = { something: ''; }; }", "{}", "class Identifier { prop = {}; }");
            });

            it("should set initializer when there's an inline comment", () => {
                doClassPropTest("class Identifier { prop/*comment*/; }", "2", "class Identifier { prop = 2/*comment*/; }");
            });

            it("should set initializer when there's a comment after and no semi-colon", () => {
                doClassPropTest("class Identifier { prop/*comment*/ }", "2", "class Identifier { prop = 2/*comment*/ }");
            });
        });
    });

    describe(nameof<ClassDeclaration>(n => n.fill), () => {
        function doTest(startingCode: string, structure: InitializerExpressionableNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
            const firstProperty = firstChild.getInstanceProperties()[0] as PropertyDeclaration;
            firstProperty.fill(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should modify when setting", () => {
            doTest("class Identifier { prop }", { initializer: "4" }, "class Identifier { prop = 4 }");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("class Identifier { prop = 4 }", { }, "class Identifier { prop = 4 }");
        });
    });
});
