import {expect} from "chai";
import {ParameteredNode, FunctionDeclaration, ParameterDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ParameteredNode), () => {
    describe(nameof<ParameteredNode>(d => d.getParameters), () => {
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
