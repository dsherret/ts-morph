import {expect} from "chai";
import {ImplementsClauseableNode, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ImplementsClauseableNode), () => {
    describe(nameof<ImplementsClauseableNode>(n => n.getImplementsExpressions), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier extends Base implements IBase, IBase2 {}");
        const implementsExpressions = firstChild.getImplementsExpressions();

        it("should get all the implements expressions", () => {
            expect(implementsExpressions.length).to.equal(2);
        });
    });
});
