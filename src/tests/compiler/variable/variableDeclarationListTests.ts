import {expect} from "chai";
import {VariableStatement, VariableDeclarationList, VariableDeclarationType} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

// todo: need to add tests here for getMembers
describe(nameof(VariableDeclarationList), () => {
    describe(nameof<VariableDeclarationList>(d => d.getDeclarationType), () => {
        it("should get var for a var variable", () => {
            const {firstChild} = getInfoFromText<VariableStatement>("var myVar;");
            expect(firstChild.getDeclarationList().getDeclarationType()).to.equal(VariableDeclarationType.Var);
        });

        it("should get let for a let variable", () => {
            const {firstChild} = getInfoFromText<VariableStatement>("let myVar;");
            expect(firstChild.getDeclarationList().getDeclarationType()).to.equal(VariableDeclarationType.Let);
        });

        it("should get const for a const variable", () => {
            const {firstChild} = getInfoFromText<VariableStatement>("const myVar = 3;");
            expect(firstChild.getDeclarationList().getDeclarationType()).to.equal(VariableDeclarationType.Const);
        });
    });
});
