import { expect } from "chai";
import { BodyableNode, ClassDeclaration, FunctionDeclaration } from "../../../../compiler";
import { WriterFunction } from "../../../../types";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(BodyableNode), () => {
    describe(nameof<BodyableNode>(n => n.setBodyText), () => {
        describe("using a writer", () => {
            function doTest(startCode: string, writerFunc: WriterFunction, expectedCode: string) {
                const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
                firstChild.setBodyText(writerFunc);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should set the body text with only one ending newline when writing a line at the end", () => {
                doTest(
                    "function myFunction() {}",
                    writer => {
                        writer.writeLine("test;").writeLine("test2;");
                    },
                    "function myFunction() {\n    test;\n    test2;\n}"
                );
            });

            it("should set the body text with only one ending newline when not writing a line at the end", () => {
                doTest(
                    "function myFunction() {}",
                    writer => {
                        writer.writeLine("test;").write("test2;");
                    },
                    "function myFunction() {\n    test;\n    test2;\n}"
                );
            });
        });

        describe("class method", () => {
            function doTest(startCode: string, newText: string, expectedCode: string) {
                const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
                firstChild.getInstanceMethods()[0].setBodyText(newText);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should set the body text with the correct indentation", () => {
                doTest("class C {\n    myMethod() {\n        const test = 5;\n    }\n}\n", "var myVar;\nfunction myInnerFunction() {\n}",
                    "class C {\n    myMethod() {\n        var myVar;\n        function myInnerFunction() {\n        }\n    }\n}\n");
            });

            it("should add a body if none exists", () => {
                doTest("declare class C {\n    myMethod();\n}", "var myVar;", "declare class C {\n    myMethod() {\n        var myVar;\n    }\n}");
            });
        });

        describe("function", () => {
            function doTest(startCode: string, newText: string, expectedCode: string) {
                const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
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

            it("should set the body text when not exists", () => {
                doTest("function myFunction();", "var myVar;", "function myFunction() {\n    var myVar;\n}");
            });

            it("should insert multiple lines on the correct indentation", () => {
                doTest("function myFunction() {\n    \n}", "var myVar;\nlet mySecond;", "function myFunction() {\n    var myVar;\n    let mySecond;\n}");
            });
        });

        describe("nested function", () => {
            function doTest(startCode: string, newText: string, expectedCode: string) {
                const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
                firstChild.getFunctions()[0].setBodyText(newText);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should insert into a function within a function", () => {
                doTest("function myFunction() {\n    function myInnerFunction() {}\n}", "var myVar;\nlet mySecond;",
                    "function myFunction() {\n    function myInnerFunction() {\n        var myVar;\n        let mySecond;\n    }\n}");
            });
        });
    });

    describe(nameof<FunctionDeclaration>(n => n.getBodyText), () => {
        function doTest(startCode: string, bodyText: string | undefined) {
            const { firstChild } = getInfoFromText<FunctionDeclaration>(startCode);
            expect(firstChild.getBodyText()).to.equal(bodyText);
        }

        it("should get when there is none", () => {
            doTest("function test();", undefined);
        });

        it("should get when there is a lot of whitespace", () => {
            doTest("function test() {\n   \t\n\r\n   \t}", "");
        });

        it("should get without indentation", () => {
            doTest("function test() {\n    export class Test {\n        prop: string;\n    }\n}\n}", "export class Test {\n    prop: string;\n}");
        });
    });

    describe(nameof<BodyableNode>(n => n.hasBody), () => {
        function doTest(startCode: string, value: boolean) {
            const { firstChild } = getInfoFromText<FunctionDeclaration>(startCode);
            expect(firstChild.hasBody()).to.equal(value);
        }

        it("should have a body when it does", () => {
            doTest("function myFunction() {\n}", true);
        });

        it("should not have a body when it doesn't", () => {
            doTest("function myFunction(): boolean;", false);
        });
    });

    describe(nameof<BodyableNode>(n => n.addBody), () => {
        function doTest(startCode: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
            firstChild.addBody();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should do nothing when it exists", () => {
            doTest("function myFunction() {\n}", "function myFunction() {\n}");
        });

        it("should add the function body when it doesn't exist and has a type", () => {
            doTest("function myFunction(): string;", "function myFunction(): string {\n}");
        });

        it("should add the function body when it doesn't exist", () => {
            doTest("function myFunction();", "function myFunction() {\n}");
        });

        it("should add the function body when it doesn't exist and has no semicolon", () => {
            doTest("function myFunction()", "function myFunction() {\n}");
        });
    });

    describe(nameof<BodyableNode>(n => n.removeBody), () => {
        function doTest(startCode: string, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(startCode);
            firstChild.removeBody();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove the function body when it exists", () => {
            doTest("function myFunction() {\n}", "function myFunction();");
        });

        it("should remove the function body when it exists and is on a newline", () => {
            doTest("function myFunction()\n{\n}", "function myFunction();");
        });

        it("should remove the function body when it exists and has a type", () => {
            doTest("function myFunction(): string {\n}", "function myFunction(): string;");
        });

        it("should do nothing when it doesn't exist", () => {
            doTest("function myFunction();", "function myFunction();");
        });
    });
});
