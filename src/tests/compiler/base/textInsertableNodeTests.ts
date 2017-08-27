import {expect} from "chai";
import * as errors from "./../../../errors";
import {TextInsertableNode, SourceFile, ClassDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TextInsertableNode), () => {
    describe(nameof<TextInsertableNode>(n => n.replaceText), () => {
        describe(nameof(SourceFile), () => {
            function doTest(startCode: string, range: [number, number], insertCode: string, expectedCode: string) {
                const {sourceFile} = getInfoFromText(startCode);
                sourceFile.replaceText(range, insertCode);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should throw when specifying a position outside the lower bound", () => {
                const {sourceFile} = getInfoFromText("");
                expect(() => sourceFile.replaceText([-1, 0], "text;")).to.throw(errors.InvalidOperationError);
            });

            it("should throw when specifying a position outside the upper bound", () => {
                const {sourceFile} = getInfoFromText("");
                expect(() => sourceFile.replaceText([1, 1], "text;")).to.throw(errors.InvalidOperationError);
            });

            it("should throw when specifying an end position outside the upper bound", () => {
                const {sourceFile} = getInfoFromText("");
                expect(() => sourceFile.replaceText([0, 1], "text;")).to.throw(errors.InvalidOperationError);
            });

            it("should throw when specifying a position greater than the end position", () => {
                const {sourceFile} = getInfoFromText("  ");
                expect(() => sourceFile.replaceText([1, 0], "text;")).to.throw(errors.ArgumentError);
            });

            it("should replace the text specified", () => {
                doTest("var t;", [4, 5], "u", "var u;");
            });
        });

        describe(nameof(ClassDeclaration), () => {
            function doTest(startCode: string, range: [number, number], insertCode: string, expectedCode: string) {
                const {sourceFile, firstChild} = getInfoFromText<ClassDeclaration>(startCode);
                firstChild.replaceText(range, insertCode);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
                expect(() => firstChild.getInstanceProperties()).to.not.throw();
            }

            it("should throw when specifying a position outside the lower bound", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class MyClass {}");
                expect(() => firstChild.replaceText([14, 14], "prop;")).to.throw(errors.InvalidOperationError);
            });

            it("should throw when specifying a position outside the upper bound", () => {
                const {firstChild} = getInfoFromText<ClassDeclaration>("class MyClass {}");
                expect(() => firstChild.replaceText([16, 16], "prop;")).to.throw(errors.InvalidOperationError);
            });

            it("should insert when specifying the correct bounds", () => {
                doTest("class MyClass {}", [15, 15], "prop;", "class MyClass {prop;}");
            });

            it("should replace when replacing text", () => {
                doTest("class MyClass {myPreviousProp;}", [15, 30], " prop; ", "class MyClass { prop; }");
            });
        });
    });

    describe(nameof<TextInsertableNode>(n => n.insertText), () => {
        describe(nameof(SourceFile), () => {
            function doTest(startCode: string, pos: number, insertCode: string, expectedCode: string) {
                const {sourceFile} = getInfoFromText(startCode);
                sourceFile.insertText(pos, insertCode);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            it("should insert text into an empty source file", () => {
                doTest("", 0, "class MyClass {}", "class MyClass {}");
            });

            it("should insert text into a source file at the beginning", () => {
                doTest("class MyClass {}", 0, "interface MyInterface {}\n\n", "interface MyInterface {}\n\nclass MyClass {}");
            });

            it("should insert text into a source file in the middle", () => {
                doTest("class MyClass {}", 15, "\n    prop;\n", "class MyClass {\n    prop;\n}");
            });

            it("should insert text into a source file at the end", () => {
                doTest("class MyClass {}", 16, "\n\ninterface MyInterface {}", "class MyClass {}\n\ninterface MyInterface {}");
            });
        });
    });

    describe(nameof<TextInsertableNode>(n => n.removeText), () => {
        describe(nameof(SourceFile), () => {
            function doTest(startCode: string, pos: number, end: number, expectedCode: string) {
                const {sourceFile} = getInfoFromText(startCode);
                sourceFile.removeText(pos, end);
                expect(sourceFile.getFullText()).to.equal(expectedCode);
            }

            // no need to do so many tests in here because they're already covered by replaceText
            it("should remove the specified range", () => {
                doTest("class MyClass {}", 7, 13, "class M {}");
            });
        });
    });
});
