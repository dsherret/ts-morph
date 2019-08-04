import { expect } from "chai";
import { ClassDeclaration, PropertyDeclaration, QuestionTokenableNode } from "../../../../compiler";
import { QuestionTokenableNodeStructure } from "../../../../structures";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(QuestionTokenableNode), () => {
    function getInfoWithFirstMember(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return { ...result, firstMember: result.firstChild.getMembers()[0] as QuestionTokenableNode };
    }

    describe(nameof<QuestionTokenableNode>(d => d.hasQuestionToken), () => {
        function doTest(text: string, value: boolean) {
            const { firstMember } = getInfoWithFirstMember(text);
            expect(firstMember.hasQuestionToken()).to.equal(value);
        }

        it("should have when property with one", () => {
            doTest("class MyClass { prop?: string; }", true);
        });

        it("should have when a method with one", () => {
            doTest("declare class MyClass { myMethod?(): string; }", true);
        });

        it("should not have when not has one", () => {
            doTest("class MyClass { prop: string; }", false);
        });
    });

    describe(nameof<QuestionTokenableNode>(d => d.getQuestionTokenNode), () => {
        it("should be get the question token node", () => {
            const { firstMember } = getInfoWithFirstMember("class MyClass { prop?: string; }");
            expect(firstMember.getQuestionTokenNode()!.getText()).to.equal("?");
        });

        it("should be undefined when not optional", () => {
            const { firstMember } = getInfoWithFirstMember("class MyClass { prop: string;} ");
            expect(firstMember.getQuestionTokenNode()).to.be.undefined;
        });
    });

    describe(nameof<QuestionTokenableNode>(d => d.getQuestionTokenNodeOrThrow), () => {
        it("should be get the question token node", () => {
            const { firstMember } = getInfoWithFirstMember("class MyClass {\nprop?: string;}\n");
            expect(firstMember.getQuestionTokenNodeOrThrow().getText()).to.equal("?");
        });

        it("should throw when not optional", () => {
            const { firstMember } = getInfoWithFirstMember("class MyClass {\nprop: string;}\n");
            expect(() => firstMember.getQuestionTokenNodeOrThrow()).to.throw();
        });
    });

    describe(nameof<QuestionTokenableNode>(d => d.setHasQuestionToken), () => {
        function doTest(startText: string, value: boolean, expected: string) {
            const { firstMember, sourceFile } = getInfoWithFirstMember(startText);
            firstMember.setHasQuestionToken(value);
            expect(sourceFile.getFullText()).to.be.equal(expected);
        }

        it("should be set as optional when not optional", () => {
            doTest("class MyClass { prop: string; }", true, "class MyClass { prop?: string; }");
        });

        it("should be set as optional when has an exclamation token", () => {
            doTest("class MyClass { prop!: string; }", true, "class MyClass { prop?: string; }");
        });

        it("should be set as not optional when optional", () => {
            doTest("class MyClass { prop?: string; }", false, "class MyClass { prop: string; }");
        });

        it("should do nothing when setting to same value", () => {
            doTest("class MyClass { prop: string; }", false, "class MyClass { prop: string; }");
        });

        it("should be set as optional when has no type and has a semi-colon", () => {
            doTest("class MyClass { prop; }", true, "class MyClass { prop?; }");
        });

        it("should be set as optional when has no type nor semi-colon", () => {
            doTest("class MyClass { prop }", true, "class MyClass { prop? }");
        });

        it("should set when a method", () => {
            doTest("declare class MyClass { method(): string; }", true, "declare class MyClass { method?(): string; }");
        });

        it("should set when a method with type parameters", () => {
            doTest("declare class MyClass { method<T>(): string; }", true, "declare class MyClass { method?<T>(): string; }");
        });

        it("should remove when a method", () => {
            doTest("declare class MyClass { method?(): string; }", false, "declare class MyClass { method(): string; }");
        });
    });

    describe(nameof<PropertyDeclaration>(p => p.set), () => {
        function doTest(startCode: string, structure: QuestionTokenableNodeStructure, expectedCode: string) {
            const { firstMember, sourceFile } = getInfoWithFirstMember(startCode);
            (firstMember as PropertyDeclaration).set(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify when not set and structure empty", () => {
            doTest("class Identifier { prop: string; }", {}, "class Identifier { prop: string; }");
        });

        it("should not modify when set and structure empty", () => {
            doTest("class Identifier { prop?: string; }", {}, "class Identifier { prop?: string; }");
        });

        it("should modify when setting true", () => {
            doTest("class Identifier { prop: string; }", { hasQuestionToken: true }, "class Identifier { prop?: string; }");
        });
    });

    describe(nameof<PropertyDeclaration>(p => p.getStructure), () => {
        function doTest(startCode: string, hasToken: boolean) {
            const { firstMember } = getInfoWithFirstMember(startCode);
            expect((firstMember as PropertyDeclaration).getStructure().hasQuestionToken).to.equal(hasToken);
        }

        it("should be false when not has one", () => {
            doTest("class Identifier { prop: string; }", false);
        });

        it("should be true when has one", () => {
            doTest("class Identifier { prop?: string; }", true);
        });
    });
});
