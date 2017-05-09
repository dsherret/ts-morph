import {expect} from "chai";
import * as errors from "./../../../errors";
import {ImplementsClauseableNode, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ImplementsClauseableNode), () => {
    describe(nameof<ImplementsClauseableNode>(n => n.getImplements), () => {
        it("should return an empty array when they don't exist", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            const implementsExpressions = firstChild.getImplements();
            expect(implementsExpressions.length).to.equal(0);
        });

        it("should return an empty array when they don't exist, but an extends does", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier extends Base {}");
            const implementsExpressions = firstChild.getImplements();
            expect(implementsExpressions.length).to.equal(0);
        });

        it("should get all the implements expressions when they exist", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier extends Base implements IBase, IBase2 {}");
            const implementsExpressions = firstChild.getImplements();
            expect(implementsExpressions.length).to.equal(2);
        });
    });

    describe(nameof<ImplementsClauseableNode>(n => n.addImplements), () => {
        it("should add an implements", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("  class Identifier {}  ");
            firstChild.addImplements("Base");
            expect(sourceFile.getFullText()).to.equal("  class Identifier implements Base {}  ");
        });

        it("should add an implements when the brace is right beside the identifier", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("  class Identifier{}  ");
            firstChild.addImplements("Base");
            expect(sourceFile.getFullText()).to.equal("  class Identifier implements Base {}  ");
        });

        it("should add an implements when an implements already exists", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class Identifier implements Base1 {}");
            firstChild.addImplements("Base2");
            expect(sourceFile.getFullText()).to.equal("class Identifier implements Base1, Base2 {}");
        });

        it("should throw an error when providing invalid input", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class Identifier implements Base1 {}");
            expect(() => firstChild.addImplements("")).to.throw();
            expect(() => firstChild.addImplements("  ")).to.throw();
            expect(() => firstChild.addImplements(5 as any)).to.throw();
        });
    });
});
