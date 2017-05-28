import {expect} from "chai";
import {ClassDeclaration, PropertyDeclaration, QuestionTokenableNode} from "./../../../compiler";
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

    describe(nameof<QuestionTokenableNode>(d => d.setIsOptional), () => {
        it("should be set as optional when not optional", () => {
            const {firstProperty, sourceFile} = getInfoWithFirstPropertyFromText("class MyClass { prop: string; }");
            firstProperty.setIsOptional(true);
            expect(sourceFile.getFullText()).to.be.equal("class MyClass { prop?: string; }");
        });

        it("should be set as not optional when optional", () => {
            const {firstProperty, sourceFile} = getInfoWithFirstPropertyFromText("class MyClass { prop?: string; }");
            firstProperty.setIsOptional(false);
            expect(sourceFile.getFullText()).to.be.equal("class MyClass { prop: string; }");
        });

        it("should do nothing when setting to same value", () => {
            const {firstProperty, sourceFile} = getInfoWithFirstPropertyFromText("class MyClass { prop: string; }");
            firstProperty.setIsOptional(false);
            expect(sourceFile.getFullText()).to.be.equal("class MyClass { prop: string; }");
        });
    });
});
