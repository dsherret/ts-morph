import { expect } from "chai";
import { ClassDeclaration, ImplementsClauseableNode } from "../../../compiler";
import { ImplementsClauseableNodeStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

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

    describe(nameof<ImplementsClauseableNode>(n => n.removeImplements), () => {
        function doTest(startingCode: string, index: number, expectedCode: string) {
            doIndexTest();
            doNodeTest();

            function doIndexTest() {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
                firstChild.removeImplements(index);
                expect(firstChild.getText()).to.equal(expectedCode);
            }

            function doNodeTest() {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
                firstChild.removeImplements(firstChild.getImplements()[index]);
                expect(firstChild.getText()).to.equal(expectedCode);
            }
        }

        it("should throw when trying to remove and none exist", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class C {}");
            expect(() => firstChild.removeImplements(0)).to.throw();
        });

        it("should throw when specifying a bad index", () => {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("class C implements B {}");
            expect(() => firstChild.removeImplements(1)).to.throw();
        });

        it("should remove the implements when there is one", () => {
            doTest("class MyClass implements T1 {}", 0, "class MyClass {}");
        });

        it("should remove the implements when there is one and an extends exists", () => {
            doTest("class MyClass extends B implements T1 {}", 0, "class MyClass extends B {}");
        });

        it("should remove the implements when there are multiple and the first is specified", () => {
            doTest("class MyClass implements T1, T2 {}", 0, "class MyClass implements T2 {}");
        });

        it("should remove the implements when there are multiple and the middle is specified", () => {
            doTest("class MyClass implements T1, T2, T3 {}", 1, "class MyClass implements T1, T3 {}");
        });

        it("should remove the implements when there are multiple and the last is specified", () => {
            doTest("class MyClass implements T1, T2 {}", 1, "class MyClass implements T1 {}");
        });
    });

    describe(nameof<ClassDeclaration>(n => n.fill), () => {
        function doTest(startingCode: string, structure: ImplementsClauseableNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startingCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should modify when setting one", () => {
            doTest("class MyClass {}", { implements: ["Test"] }, "class MyClass implements Test {}");
        });

        it("should modify when setting two", () => {
            doTest("class MyClass {}", { implements: ["Test", "Test2"] }, "class MyClass implements Test, Test2 {}");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("class MyClass {}", {}, "class MyClass {}");
        });

        it("should not modify anything if the structure has an empty array", () => {
            doTest("class MyClass {}", { implements: [] }, "class MyClass {}");
        });
    });
});
