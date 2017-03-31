import {expect} from "chai";
import {AbstractableNode, ClassDeclaration} from "./../../../../compiler";
import {getInfoFromText} from "./../../testHelpers";

describe(nameof(AbstractableNode), () => {
    describe(nameof<AbstractableNode>(d => d.getAbstractKeyword), () => {
        it("should get the abstract keyword when abstract", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("abstract class Identifier {}");
            expect(firstChild.getAbstractKeyword()!.getText()).to.be.equal("abstract");
        });

        it("should return undefined when not abstract", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            expect(firstChild.getAbstractKeyword()).to.be.undefined;
        });
    });

    describe(nameof<AbstractableNode>(d => d.getIsAbstract), () => {
        it("should be abstract when abstract", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("abstract class Identifier {}");
            expect(firstChild.getIsAbstract()).to.be.true;
        });

        it("should be not abstract when not abstract", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            expect(firstChild.getIsAbstract()).to.be.false;
        });
    });

    describe(nameof<AbstractableNode>(d => d.setIsAbstract), () => {
        it("should be set to abstract", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("class Identifier {}");
            firstChild.setIsAbstract(true);
            expect(firstChild.getText()).to.equal("abstract class Identifier {}");
        });

        it("should be set to not abstract", () => {
            const {firstChild} = getInfoFromText<ClassDeclaration>("abstract class Identifier {}");
            firstChild.setIsAbstract(false);
            expect(firstChild.getText()).to.equal("class Identifier {}");
        });
    });
});
