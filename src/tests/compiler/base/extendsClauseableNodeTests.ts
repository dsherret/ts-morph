import {expect} from "chai";
import {ExtendsClauseableNode, InterfaceDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ExtendsClauseableNode), () => {
    describe(nameof<ExtendsClauseableNode>(n => n.getExtends), () => {
        it("should return an empty array when they don't exist", () => {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>("export interface Identifier {}");
            const extendsExpressions = firstChild.getExtends();
            expect(extendsExpressions.length).to.equal(0);
        });

        it("should get all the extends expressions when they exist", () => {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>("export interface Identifier extends Base, Base2 {}");
            const extendsExpressions = firstChild.getExtends();
            expect(extendsExpressions.length).to.equal(2);
        });
    });
});
