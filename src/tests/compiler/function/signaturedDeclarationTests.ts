import {expect} from "chai";
import {SignaturedDeclaration, FunctionDeclaration, ParameterDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(SignaturedDeclaration), () => {
    describe(nameof<SignaturedDeclaration>(d => d.getParameters), () => {
        const {firstChild} = getInfoFromText<FunctionDeclaration>("function func(param1: string, param2: number){}");
        const parameters = firstChild.getParameters();

        it("should get the right number of parameters", () => {
            expect(parameters.length).to.equal(2);
        });

        it("should have parameter of type ParameterDeclaration", () => {
            expect(parameters[0]).to.be.instanceOf(ParameterDeclaration);
        });
    });
});
