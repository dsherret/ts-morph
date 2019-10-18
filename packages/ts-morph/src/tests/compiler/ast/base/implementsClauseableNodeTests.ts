import { expect } from "chai";
import { ClassDeclaration, ImplementsClauseableNode } from "../../../../compiler";
import { ImplementsClauseableNodeStructure } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ImplementsClauseableNode), () => {
    describe(nameof<ImplementsClauseableNode>(n => n.getImplements), () => {
        it("should return an empty array when they don't exist", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier {}");
            const implementsExpressions = firstChild.getImplements();
            expect(implementsExpressions.length).to.equal(0);
        });

        it("should return an empty array when they don't exist, but an extends does", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier extends Base {}");
            const implementsExpressions = firstChild.getImplements();
            expect(implementsExpressions.length).to.equal(0);
        });

        it("should get all the implements expressions when they exist", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier extends Base implements IBase, IBase2 {}");
            const implementsExpressions = firstChild.getImplements();
            expect(implementsExpressions.length).to.equal(2);
        });
    });

    describe(nameof<ImplementsClauseableNode>(n => n.addImplements), () => {
        function doTest(code: string, implementsTextOrArray: string | WriterFunction | (string | WriterFunction)[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            if (implementsTextOrArray instanceof Array || implementsTextOrArray instanceof Function) {
                const originalLength = firstChild.getImplements().length;
                const result = firstChild.addImplements(implementsTextOrArray);
                const newLength = firstChild.getImplements().length;
                expect(result.length).to.equal(newLength - originalLength);
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
            doTest("class Identifier implements Base1 {}", ["Base2", writer => writer.write("Base3")], "class Identifier implements Base1, Base2, Base3 {}");
        });

        it("should add multiple implements with a writer on a newline", () => {
            doTest("class Identifier implements Base1 {}", writer => writer.writeLine("Base2,").write("Base3"),
                "class Identifier implements Base1, Base2,\n    Base3 {}");
        });

        it("should do nothing if an empty array", () => {
            doTest("class Identifier {}", [], "class Identifier {}");
        });

        it("should throw an error when providing invalid input", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class Identifier implements Base1 {}");
            expect(() => firstChild.addImplements("")).to.throw();
            expect(() => firstChild.addImplements("  ")).to.throw();
        });
    });

    describe(nameof<ImplementsClauseableNode>(n => n.insertImplements), () => {
        function doTest(code: string, index: number, implementsTextOrArray: string | WriterFunction | (string | WriterFunction)[], expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(code);
            if (implementsTextOrArray instanceof Array || implementsTextOrArray instanceof Function) {
                const originalLength = firstChild.getImplements().length;
                const result = firstChild.insertImplements(index, implementsTextOrArray);
                const newLength = firstChild.getImplements().length;
                expect(result.length).to.equal(newLength - originalLength);
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
            doTest("class Identifier implements Base, Base1 {}", 1, ["Base2", writer => writer.write("Base3")],
                "class Identifier implements Base, Base2, Base3, Base1 {}");
        });

        it("should insert with a writer", () => {
            doTest("class Identifier implements Base {}", 1, writer => writer.write("Base2"), "class Identifier implements Base, Base2 {}");
        });
    });

    describe(nameof<ImplementsClauseableNode>(n => n.removeImplements), () => {
        function doTest(startingCode: string, index: number, expectedCode: string) {
            doIndexTest();
            doNodeTest();

            function doIndexTest() {
                const { firstChild } = getInfoFromText<ClassDeclaration>(startingCode);
                firstChild.removeImplements(index);
                expect(firstChild.getText()).to.equal(expectedCode);
            }

            function doNodeTest() {
                const { firstChild } = getInfoFromText<ClassDeclaration>(startingCode);
                firstChild.removeImplements(firstChild.getImplements()[index]);
                expect(firstChild.getText()).to.equal(expectedCode);
            }
        }

        it("should throw when trying to remove and none exist", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class C {}");
            expect(() => firstChild.removeImplements(0)).to.throw();
        });

        it("should throw when specifying a bad index", () => {
            const { firstChild } = getInfoFromText<ClassDeclaration>("class C implements B {}");
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

    describe(nameof<ClassDeclaration>(n => n.set), () => {
        function doTest(startingCode: string, structure: ImplementsClauseableNodeStructure, expectedCode: string) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(startingCode);
            firstChild.set(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should modify when setting one", () => {
            doTest("class MyClass {}", { implements: ["Test"] }, "class MyClass implements Test {}");
        });

        it("should modify when setting two", () => {
            doTest("class MyClass {}", { implements: ["Test", "Test2"] }, "class MyClass implements Test, Test2 {}");
        });

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("class MyClass implements Test {}", {}, "class MyClass implements Test {}");
        });

        it("should replace existing", () => {
            doTest("class MyClass implements Test, Test2 {}", { implements: ["New1", "New2"] }, "class MyClass implements New1, New2 {}");
        });

        it("should remove existing when specifying a value", () => {
            doTest("class MyClass implements Test {}", { implements: [] }, "class MyClass {}");
        });
    });

    describe(nameof<ClassDeclaration>(n => n.getStructure), () => {
        function doTest(startingCode: string, implementsTexts: string[]) {
            const { firstChild } = getInfoFromText<ClassDeclaration>(startingCode);
            expect(firstChild.getStructure().implements).to.deep.equal(implementsTexts);
        }

        it("should return an empty array when not exists", () => {
            doTest("class Test {}", []);
        });

        it("should return extends when exists", () => {
            doTest("class Test implements Test1, Test2 {}", ["Test1", "Test2"]);
        });
    });
});
