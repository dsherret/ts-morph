import {expect} from "chai";
import {BodyableNode, ClassDeclaration, FunctionDeclaration} from "./../../../compiler";
import {BodyableNodeStructure} from "./../../../structures";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(BodyableNode), () => {
    describe(nameof<BodyableNode>(n => n.setBodyText), () => {
        describe("class method", () => {
            function doTest(startCode: string, newText: string, expectedCode: string) {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>(startCode);
                firstChild.getInstanceMethods()[0].setBodyText(newText);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should set the body text with the correct indentation", () => {
                doTest("class C {\n    myMethod() {\n        const test = 5;\n    }\n}\n",
                    "var myVar;\nfunction myInnerFunction() {\n}",
                    "class C {\n    myMethod() {\n        var myVar;\n        function myInnerFunction() {\n        }\n    }\n}\n");
            });

            it("should throw if no body exists", () => {
                const {firstChild, sourceFile} = getInfoFromText<ClassDeclaration>("declare class C { myMethod(); }");
                expect(() => {
                    firstChild.getInstanceMethods()[0].setBodyText("'some text';");
                }).to.throw();
            });
        });

        describe("function", () => {
            function doTest(startCode: string, newText: string, expectedCode: string) {
                const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
                firstChild.setBodyText(newText);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should set the body text when empty", () => {
                doTest("function myFunction() {}", "var myVar;", "function myFunction() {\n    var myVar;\n}");
            });

            it("should not indent an empty line", () => {
                doTest("function myFunction() {}", "var myVar;\n\n'test';", "function myFunction() {\n    var myVar;\n\n    'test';\n}");
            });

            it("should set the body text to empty when providing an empty string", () => {
                doTest("function myFunction() { /* some text */ }", "", "function myFunction() {\n}");
            });

            it("should set the body text when not empty", () => {
                doTest("function myFunction() {\n    function myInnerFunction() {}\n}", "var myVar;", "function myFunction() {\n    var myVar;\n}");
            });

            it("should insert multiple lines on the correct indentation", () => {
                doTest("function myFunction() {\n    \n}", "var myVar;\nlet mySecond;",
                    "function myFunction() {\n    var myVar;\n    let mySecond;\n}");
            });
        });

        describe("nested function", () => {
            function doTest(startCode: string, newText: string, expectedCode: string) {
                const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
                firstChild.getFunctions()[0].setBodyText(newText);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should insert into a function within a function", () => {
                doTest("function myFunction() {\n    function myInnerFunction() {}\n}", "var myVar;\nlet mySecond;",
                    "function myFunction() {\n    function myInnerFunction() {\n        var myVar;\n        let mySecond;\n    }\n}");
            });
        });
    });

    describe(nameof<FunctionDeclaration>(n => n.fill), () => {
        function doTest(startCode: string, structure: BodyableNodeStructure, expectedCode: string) {
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(startCode);
            firstChild.fill(structure);
            expect(firstChild.getText()).to.equal(expectedCode);
        }

        it("should set the text of a function", () => {
            doTest("function myFunction() {\n}", { bodyText: "var myVar;" }, "function myFunction() {\n    var myVar;\n}");
        });
    });
});
