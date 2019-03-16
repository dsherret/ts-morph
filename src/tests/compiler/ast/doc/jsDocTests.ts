﻿import { expect } from "chai";
import { JSDoc } from "../../../../compiler";
import { JSDocStructure } from "../../../../structures";
import { getInfoFromText, OptionalTrivia } from "../../testHelpers";

describe(nameof(JSDoc), () => {
    describe(nameof<JSDoc>(d => d.remove), () => {
        function doTest(text: string, index: number, jsDocIndex: number, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getFunctions()[index].getJsDocs()[jsDocIndex].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the js doc", () => {
            doTest("enum I {}\n\n/** Test */\nfunction func() {}", 0, 0, "enum I {}\n\nfunction func() {}");
        });

        it("should remove the js doc when first", () => {
            doTest("enum I {}\n\n/** first */\n/** second */\nfunction func() {}", 0, 0, "enum I {}\n\n/** second */\nfunction func() {}");
        });

        it("should remove the js doc when in the middle", () => {
            doTest("enum I {}\n\n/** first */\n/** second */\n/** third */\nfunction func() {}", 0, 1, "enum I {}\n\n/** first */\n/** third */\nfunction func() {}");
        });

        it("should remove the js doc when last", () => {
            doTest("enum I {}\n\n/** first */\n/** second */\nfunction func() {}", 0, 1, "enum I {}\n\n/** first */\nfunction func() {}");
        });
    });

    describe(nameof<JSDoc>(d => d.getComment), () => {
        function doTest(text: string, expectedComment: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const comment = sourceFile.getFunctions()[0].getJsDocs()[0].getComment();
            expect(comment).to.equal(expectedComment);
        }

        it("should get the comment when it exists", () => {
            doTest("/**\n * Description\n */function identifier() {}", "Description");
        });

        it("should be undefined when it doesn't exist", () => {
            doTest("/**\n *\n */function identifier() {}", undefined);
        });
    });

    describe(nameof<JSDoc>(d => d.setComment), () => {
        function doTest(text: string, comment: string, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getFunctions()[0].getJsDocs()[0].setComment(comment);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set a new comment with one line", () => {
            doTest("/**\n * Description\n */function identifier() {}", "New Text", "/**\n * New Text\n */function identifier() {}");
        });

        it("should set a new comment with multiple lines", () => {
            doTest("/**\n * Description\n */function identifier() {}", "One\nTwo\r\nThree", "/**\n * One\n * Two\n * Three\n */function identifier() {}");
        });

        it("should set a new comment when originally all on the same line", () => {
            doTest("/** Description */function identifier() {}", "New", "/**\n * New\n */function identifier() {}");
        });

        it("should set a new comment without affecting the tags", () => {
            doTest("/**\n * Description\n * @param - Something */function identifier() {}", "New", "/**\n * New\n * @param - Something */function identifier() {}");
        });

        it("should set a new comment without affecting the tags when the first tag has some space before it", () => {
            doTest("/**\n * Description\n *   @param - Something */function identifier() {}", "New", "/**\n * New\n *   @param - Something */function identifier() {}");
        });
    });

    describe(nameof<JSDoc>(d => d.getTags), () => {
        function doTest(text: string, expectedTags: string[]) {
            const { sourceFile } = getInfoFromText(text);
            const tags = sourceFile.getFunctions()[0].getJsDocs()[0].getTags();
            expect(tags.map(t => t.getText())).to.deep.equal(expectedTags);
        }

        it("should return an empty array when no tags exist", () => {
            doTest("/**\n * Description\n */function identifier() {}", []);
        });

        it("should return the tags when they exist", () => {
            const text = "/**\n * Description\n * @param test - Test\n * @returns A value\n */function identifier() {}";
            doTest(text, ["@param test - Test\n * ", "@returns "]);
        });
    });

    describe(nameof<JSDoc>(d => d.getInnerText), () => {
        function doTest(text: string, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            const innerText = sourceFile.getFunctions()[0].getJsDocs()[0].getInnerText();
            expect(innerText).to.deep.equal(expectedText);
        }

        it("should return the correct inner text when on one line", () => {
            doTest("/** Description */function identifier() {}", "Description");
        });

        it("should return the correct inner text when there's no space", () => {
            doTest("/**Description*/function identifier() {}", "Description");
        });

        it("should return the correct inner text when on multiple lines", () => {
            doTest("/**\n * Description\n */function identifier() {}", "Description");
        });

        it("should return the correct inner text on multiple lines when there's no space", () => {
            doTest("/**\n *Description\n */function identifier() {}", "Description");
        });

        it("should return the correct inner text on multiple lines when there's indentation", () => {
            doTest("/**\n *     Description\n */function identifier() {}", "    Description");
        });

        it("should return the correct inner text on multiple lines when there's no star", () => {
            doTest("/**\nDescription\n */function identifier() {}", "Description");
        });

        it("should return the correct inner text with tags", () => {
            doTest("/**\n * Description\n * @param - Test\n */function identifier() {}", "Description\n@param - Test");
        });

        it("should return the correct inner text when using slash r slash n", () => {
            doTest("/**\r\n * Description\r\n * @param - Test\r\n */function identifier() {}", "Description\r\n@param - Test");
        });
    });

    describe(nameof<JSDoc>(n => n.set), () => {
        function doTest(text: string, structure: Partial<JSDocStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getClasses()[0].getJsDocs()[0].set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should not change when empty", () => {
            const code = "/** Test */\nclass Test {}";
            doTest(code, {}, code);
        });

        it("should change when specified", () => {
            doTest("/**\n * Test\n */\nclass Test {}", { description: "New" },
                "/**\n * New\n */\nclass Test {}");
        });
    });

    describe(nameof<JSDoc>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<JSDocStructure>>) {
            const { sourceFile } = getInfoFromText(text);
            const structure = sourceFile.getFunctions()[0].getJsDocs()[0].getStructure();
            expect(structure).to.deep.equal(expectedStructure);
        }

        it("should get when has nothing", () => {
            doTest("/** */function t() {}", {
                description: ""
            });
        });

        it("should get when has everything", () => {
            doTest("/** Test @param p - Testing */function t() {}", {
                description: "Test @param p - Testing" // for now...
            });
        });
    });
});
