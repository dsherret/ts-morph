import {expect} from "chai";
import {ClassDeclaration, QuestionTokenableNode} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(QuestionTokenableNode), () => {
    function getInfoWithFirstPropertyFromText(text: string) {
        const result = getInfoFromText<ClassDeclaration>(text);
        return {...result, firstProperty: result.firstChild.getInstancePropertyDeclarations()[0] };
    }

    describe(nameof<QuestionTokenableNode>(d => d.isOptional), () => {
        it("should be optional when optional", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop?: string;}\n");
            expect(firstProperty.isOptional()).to.be.true;
        });

        it("should not be optional when not optional", () => {
            const {firstProperty} = getInfoWithFirstPropertyFromText("class MyClass {\nprop: string;}\n");
            expect(firstProperty.isOptional()).to.be.false;
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
});
