import {expect} from "chai";
import {ExtendsClauseableNode, InterfaceDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(ExtendsClauseableNode), () => {
    describe(nameof<ExtendsClauseableNode>(n => n.getExtends), () => {
        function doTest(text: string, expectedLength: number) {
            const {firstChild} = getInfoFromText<InterfaceDeclaration>(text);
            const extendsExpressions = firstChild.getExtends();
            expect(extendsExpressions.length).to.equal(expectedLength);
        }

        it("should return an empty array when they don't exist", () => {
            doTest("export interface Identifier {}", 0);
        });

        it("should get all the extends expressions when they exist", () => {
            doTest("export interface Identifier extends Base, Base2 {}", 2);
        });
    });

    describe(nameof<ExtendsClauseableNode>(n => n.addExtends), () => {
        function doTest(code: string, extendsTextOrArray: string | string[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(code);
            if (extendsTextOrArray instanceof Array) {
                const result = firstChild.addExtends(extendsTextOrArray);
                expect(result.length).to.equal(extendsTextOrArray.length);
            }
            else {
                const result = firstChild.addExtends(extendsTextOrArray);
                expect(result).to.not.be.instanceOf(Array).and.to.be.not.undefined;
            }
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add an extends", () => {
            doTest("  interface Identifier {}  ", "Base", "  interface Identifier extends Base {}  ");
        });

        it("should add an extends when the brace is right beside the identifier", () => {
            doTest("  interface Identifier{}  ", "Base", "  interface Identifier extends Base {}  ");
        });

        it("should add an extends when an extends already exists", () => {
            doTest("interface Identifier extends Base1 {}", "Base2", "interface Identifier extends Base1, Base2 {}");
        });

        it("should add multiple extends", () => {
            doTest("interface Identifier {}", ["Base", "Base2"], "interface Identifier extends Base, Base2 {}");
        });

        it("should do nothing if an empty array", () => {
            doTest("interface Identifier {}", [], "interface Identifier {}");
        });

        it("should throw an error when providing invalid input", () => {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>("interface Identifier extends Base1 {}");
            expect(() => firstChild.addExtends("")).to.throw();
            expect(() => firstChild.addExtends("  ")).to.throw();
            expect(() => firstChild.addExtends(5 as any)).to.throw();
        });
    });

    describe(nameof<ExtendsClauseableNode>(n => n.insertExtends), () => {
        function doTest(code: string, index: number, extendsTextOrArray: string | string[], expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<InterfaceDeclaration>(code);
            if (extendsTextOrArray instanceof Array) {
                const result = firstChild.insertExtends(index, extendsTextOrArray);
                expect(result.length).to.equal(extendsTextOrArray.length);
            }
            else {
                const result = firstChild.insertExtends(index, extendsTextOrArray);
                expect(result).to.not.be.instanceOf(Array).and.to.be.not.undefined;
            }
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        // mosts of the tests for this are already in addExtends
        it("should insert an extends at a position", () => {
            doTest("interface Identifier extends Base, Base1 {}", 1, "Base2", "interface Identifier extends Base, Base2, Base1 {}");
        });

        it("should insert multiple extends at a position", () => {
            doTest("interface Identifier extends Base, Base1 {}", 1, ["Base2", "Base3"], "interface Identifier extends Base, Base2, Base3, Base1 {}");
        });
    });
});
