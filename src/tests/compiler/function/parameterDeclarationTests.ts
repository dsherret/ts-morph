import {expect} from "chai";
import {ParameterDeclaration, FunctionDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ParameterDeclaration), () => {
    describe(nameof<ParameterDeclaration>(d => d.isRestParameter), () => {
        it("should be a rest parameter when is one", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(...param: string[]){}");
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isRestParameter()).to.be.true;
        });

        it("should not be a rest parameter when not one", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(param: string[]){}");
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isRestParameter()).to.be.false;
        });
    });

    describe(nameof<ParameterDeclaration>(d => d.isOptional), () => {
        it("should be a optional when optional", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(param?: string){}");
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isOptional()).to.be.true;
        });

        it("should be a optional when has a default value", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(param = 4){}");
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isOptional()).to.be.true;
        });

        it("should be optional when has a rest parameter", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(...param: string[]){}");
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isOptional()).to.be.true;
        });

        it("should not be a optional otherwise", () => {
            const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(param: string){}");
            const firstParam = firstChild.getParameters()[0];
            expect(firstParam.isOptional()).to.be.false;
        });
    });
});
