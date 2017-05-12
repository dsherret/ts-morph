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

    describe(nameof<ExtendsClauseableNode>(n => n.addExtends), () => {
        it("should add an extends", () => {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>("  interface Identifier {}  ");
            firstChild.addExtends("Base");
            expect(sourceFile.getFullText()).to.equal("  interface Identifier extends Base {}  ");
        });

        it("should add an extends when the brace is right beside the identifier", () => {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>("  interface Identifier{}  ");
            firstChild.addExtends("Base");
            expect(sourceFile.getFullText()).to.equal("  interface Identifier extends Base {}  ");
        });

        it("should add an extends when an extends already exists", () => {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>("interface Identifier extends Base1 {}");
            firstChild.addExtends("Base2");
            expect(sourceFile.getFullText()).to.equal("interface Identifier extends Base1, Base2 {}");
        });

        it("should throw an error when providing invalid input", () => {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>("interface Identifier extends Base1 {}");
            expect(() => firstChild.addExtends("")).to.throw();
            expect(() => firstChild.addExtends("  ")).to.throw();
            expect(() => firstChild.addExtends(5 as any)).to.throw();
        });
    });
});
