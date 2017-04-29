import {expect} from "chai";
import {ImplementsClauseableNode, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ImplementsClauseableNode), () => {
    describe(nameof<ImplementsClauseableNode>(n => n.getImplementsExpressions), () => {
        it("should return an empty array when they don't exist", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}");
            const implementsExpressions = firstChild.getImplementsExpressions();
            expect(implementsExpressions.length).to.equal(0);
        });

        it("should return an empty array when they don't exist, but an extends does", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier extends Base {}");
            const implementsExpressions = firstChild.getImplementsExpressions();
            expect(implementsExpressions.length).to.equal(0);
        });

        it("should get all the implements expressions when they exist", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier extends Base implements IBase, IBase2 {}");
            const implementsExpressions = firstChild.getImplementsExpressions();
            expect(implementsExpressions.length).to.equal(2);
        });
    });
});
