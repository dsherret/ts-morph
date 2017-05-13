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
        function doTest(code: string, implementsTextOrArray: string | string[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);
            if (implementsTextOrArray instanceof Array) {
                const result = firstChild.addImplements(implementsTextOrArray);
                expect(result.length).to.equal(implementsTextOrArray.length);
            }
            else {
                const result = firstChild.addImplements(implementsTextOrArray);
                expect(result).to.not.be.instanceOf(Array).and.to.be.not.undefined;
            }
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add an implements", () => {
            doTest("  class Identifier {}  ", "Base", "  class Identifier implements Base {}  ");
        });

        it("should add an implements when the brace is right beside the identifier", () => {
            doTest("  class Identifier{}  ", "Base", "  class Identifier implements Base {}  ");
        });

        it("should add an implements when an implements already exists", () => {
            doTest("class Identifier implements Base1 {}", "Base2", "class Identifier implements Base1, Base2 {}");
        });

        it("should add multiple implements", () => {
            doTest("class Identifier implements Base1 {}", ["Base2", "Base3"], "class Identifier implements Base1, Base2, Base3 {}");
        });

        it("should do nothing if an empty array", () => {
            doTest("class Identifier {}", [], "class Identifier {}");
        });

        it("should throw an error when providing invalid input", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class Identifier implements Base1 {}");
            expect(() => firstChild.addImplements("")).to.throw();
            expect(() => firstChild.addImplements("  ")).to.throw();
            expect(() => firstChild.addImplements(5 as any)).to.throw();
        });
    });

    describe(nameof<ImplementsClauseableNode>(n => n.insertImplements), () => {
        function doTest(code: string, index: number, implementsTextOrArray: string | string[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(code);
            if (implementsTextOrArray instanceof Array) {
                const result = firstChild.insertImplements(index, implementsTextOrArray);
                expect(result.length).to.equal(implementsTextOrArray.length);
            }
            else {
                const result = firstChild.insertImplements(index, implementsTextOrArray);
                expect(result).to.not.be.instanceOf(Array).and.to.be.not.undefined;
            }
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        // mosts of the tests for this are already in addImplements
        it("should insert an implements at a position", () => {
            doTest("class Identifier implements Base, Base1 {}", 1, "Base2", "class Identifier implements Base, Base2, Base1 {}");
        });

        it("should insert multiple implements at a position", () => {
            doTest("class Identifier implements Base, Base1 {}", 1, ["Base2", "Base3"], "class Identifier implements Base, Base2, Base3, Base1 {}");
        });
    });
});
