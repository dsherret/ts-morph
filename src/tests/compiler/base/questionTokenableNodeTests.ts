import {expect} from "chai";
import {ClassDeclaration, PropertyDeclaration, QuestionTokenableNode} from "./../../../compiler";
import {QuestionTokenableNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(QuestionTokenableNode), () => {
    function getInfoWithFirstPropertyFromText(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return {...result, firstProperty: result.firstChild.getInstanceProperties()[0] as PropertyDeclaration };
    }

    describe(nameof<QuestionTokenableNode>(d => d.hasQuestionToken), () => {
        it("should have a question token when has one", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop?: string;}\n");
            expect(firstProperty.hasQuestionToken()).to.be.true;
        });

        it("should not have a question token when not has one", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(firstProperty.hasQuestionToken()).to.be.false;
        });
    });

    describe(nameof<QuestionTokenableNode>(d => d.getQuestionTokenNode), () => {
        it("should be get the question token node", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop?: string;}\n");
            expect(firstProperty.getQuestionTokenNode()!.getText()).to.equal("?");
        });

        it("should be undefined when not optional", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
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
        it("should be set as optional when not optional", () => {
            const {firstProperty, sourceFile} = getInfoWithFirstPropertyFromText("class MyClass { prop: string; }");
            firstProperty.setHasQuestionToken(true);
            expect(sourceFile.getFullText()).to.be.equal("class MyClass { prop?: string; }");
        });

        it("should be set as not optional when optional", () => {
            const {firstProperty, sourceFile} = getInfoWithFirstPropertyFromText("class MyClass { prop?: string; }");
            firstProperty.setHasQuestionToken(false);
            expect(sourceFile.getFullText()).to.be.equal("class MyClass { prop: string; }");
        });

        it("should do nothing when setting to same value", () => {
            const {firstProperty, sourceFile} = getInfoWithFirstPropertyFromText("class MyClass { prop: string; }");
            firstProperty.setHasQuestionToken(false);
            expect(sourceFile.getFullText()).to.be.equal("class MyClass { prop: string; }");
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
