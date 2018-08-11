import { expect } from "chai";
import { ParameterDeclaration, ClassDeclaration, PropertyDeclaration, QuestionTokenableNode } from "../../../compiler";
import * as errors from "../../../errors";
import { SyntaxKind } from "../../../typescript";
import { QuestionTokenableNodeStructure } from "../../../structures";
import { getInfoFromText, getInfoFromTextWithDescendant } from "../testHelpers";

describe(nameof(QuestionTokenableNode), () => {
    function getInfoWithFirstPropertyFromText(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return {...result, firstProperty: result.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    describe(nameof<QuestionTokenableNode>(d => d.hasQuestionToken), () => {
        function doTest(text: string, value: boolean) {
            const {firstProperty} = getInfoWithFirstPropertyFromText(text);
            expect(firstProperty.hasQuestionToken()).to.equal(value);
        }

        it("should have a question token when has one", () => {
            doTest("class MyClass { prop?: string; }", true);
        });

        it("should not have a question token when not has one", () => {
            doTest("class MyClass { prop: string; }", false);
        });
    });

    describe(nameof<QuestionTokenableNode>(d => d.getQuestionTokenNode), () => {
        it("should be get the question token node", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass { prop?: string; }");
            expect(firstProperty.getQuestionTokenNode()!.getText()).to.equal("?");
        });

        it("should be undefined when not optional", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass { prop: string;} ");
            expect(firstProperty.getQuestionTokenNode()).to.be.undefined;
        });
    });

    describe(nameof<QuestionTokenableNode>(d => d.getQuestionTokenNodeOrThrow), () => {
        it("should be get the question token node", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop?: string;}\n");
            expect(firstProperty.getQuestionTokenNodeOrThrow().getText()).to.equal("?");
        });

        it("should throw when not optional", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(() => firstProperty.getQuestionTokenNodeOrThrow()).to.throw();
        });
    });

    describe(nameof<QuestionTokenableNode>(d => d.setHasQuestionToken), () => {
        function doTest(startText: string, value: boolean, expected: string) {
            const {firstProperty, sourceFile} = getInfoWithFirstPropertyFromText(startText);
            firstProperty.setHasQuestionToken(value);
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
    });

    describe(nameof<PropertyDeclaration>(p => p.fill), () => {
        function doTest(startCode: string, structure: QuestionTokenableNodeStructure, expectedCode: string) {
            const {firstProperty, sourceFile} = getInfoWithFirstPropertyFromText(startCode);
            firstProperty.fill(structure);
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
});
