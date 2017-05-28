import {expect} from "chai";
import {ParameterDeclaration, FunctionDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ParameterDeclaration), () => {
    describe(nameof<ParameterDeclaration>(d => d.isRestParameter), () => {
        function doTest(startCode: string, isRestParameter: boolean) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isRestParameter()).to.be.equal(isRestParameter);
        }

        it("should be a rest parameter when is one", () => {
            doTest("function func(...param: string[]){}", true);
        });

        it("should not be a rest parameter when not one", () => {
            doTest("function func(param: string[]){}", false);
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.setIsRestParameter), () => {
        function doTest(startCode: string, isRestParameter: boolean, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            const firstParam = firstChild.getParameters()[0];
            firstParam.setIsRestParameter(isRestParameter, sourceFile);
            expect(sourceFile.getFullText()).to.be.equal(expectedCode);
        }

        it("should not change when not changing", () => {
            doTest("function func(...param: string[]){}", true, "function func(...param: string[]){}");
        });

        it("should set as rest parameter", () => {
            doTest("function func(param: string[]){}", true, "function func(...param: string[]){}");
        });

        it("should remove as rest parameter", () => {
            doTest("function func(...param: string[]){}", false, "function func(param: string[]){}");
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.isOptional), () => {
        function doTest(startCode: string, isOptional: boolean) {
            const {firstChild} = getInfoFromText<FunctionDeclaration>(startCode);
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isOptional()).to.be.equal(isOptional);
        }

        it("should be a optional when optional", () => {
            doTest("function func(param?: string){}", true);
        });

        it("should be a optional when has a default value", () => {
            doTest("function func(param = 4){}", true);
        });

        it("should be optional when has a rest parameter", () => {
            doTest("function func(...param: string[]){}", true);
        });

        it("should not be a optional otherwise", () => {
            doTest("function func(param: string){}", false);
        });
    });
});
