import {expect} from "chai";
import {ExtendsClauseableNode, InterfaceDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ExtendsClauseableNode), () => {
    describe(nameof<ExtendsClauseableNode>(n => n.getExtendsExpressions), () => {
        const {firstChild} = getInfoFromText<InterfaceDeclaration>("export interface Identifier extends Base, Base2 {}");
        const extendsExpressions = firstChild.getExtendsExpressions();

        it("should get all the extends expressions", () => {
            expect(extendsExpressions.length).to.equal(2);
        });
    });
});
