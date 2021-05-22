import { expect } from "chai";
import { JSDoc } from "../../../../compiler";
import { JSDocStructure, JSDocTagStructure, OptionalKind, StructureKind } from "../../../../structures";
import { fillStructures, getInfoFromText, OptionalTrivia } from "../../testHelpers";

describe(nameof(JSDoc), () => {
    describe(nameof<JSDoc>(d => d.isMultiLine), () => {
        function doTest(text: string, expectedValue: boolean) {
            const { sourceFile } = getInfoFromText(text);
            const actual = sourceFile.getFunctions()[0].getJsDocs()[0].isMultiLine();
            expect(actual).to.equal(expectedValue);
        }

        it("should be multi-line when it is", () => {
            doTest("/**\n * Test\n */\nfunction func() {}", true);
        });

        it("should not be multi-line when single-line", () => {
            doTest("/** Test */\nfunction func() {}", false);
        });
    });

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
            doTest("enum I {}\n\n/** first */\n/** second */\n/** third */\nfunction func() {}", 0, 1,
                "enum I {}\n\n/** first */\n/** third */\nfunction func() {}");
        });

        it("should remove the js doc when last", () => {
            doTest("enum I {}\n\n/** first */\n/** second */\nfunction func() {}", 0, 1, "enum I {}\n\n/** first */\nfunction func() {}");
        });
    });

    describe(nameof<JSDoc>(d => d.getDescription), () => {
        function doTest(text: string, expectedComment: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const comment = sourceFile.getFunctions()[0].getJsDocs()[0].getDescription();
            expect(comment).to.equal(expectedComment);
        }

        it("should get when it exists", () => {
            doTest("/** Description */function identifier() {}", "Description");
        });

        it("should get when it exists and is multi-line", () => {
            // multi-line js doc descriptions always start with a newline
            doTest("/**\n * Description\n */function identifier() {}", "\nDescription");
        });

        it("should get when empty, but multi-line", () => {
            doTest("/**\n *\n */function identifier() {}", "\n");
        });

        it("should be empty when empty", () => {
            doTest("/** */function identifier() {}", "");
        });

        it("should get when has trailing newline", () => {
            doTest("/**\n * Test.\n *\n * @remarks\n */function identifier() {}", "\nTest.\n");
        });
    });

    describe(nameof<JSDoc>(d => d.setDescription), () => {
        function doTest(text: string, comment: string, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.getFunctions()[0].getJsDocs()[0].setDescription(comment);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set a multi-line comment ot single line", () => {
            doTest("/**\n * Description\n */function identifier() {}", "New Text", "/** New Text */function identifier() {}");
        });

        it("should replace text of multi-line with multi-line", () => {
            doTest("/**\n * Description\n */function identifier() {}", "\nNew Text", "/**\n * New Text\n */function identifier() {}");
        });

        it("should set a new comment with multiple lines", () => {
            doTest("/**\n * Description\n */function identifier() {}", "One\nTwo\r\nThree", "/**\n * One\n * Two\n * Three\n */function identifier() {}");
        });

        it("should not add trailing whitespace when the line has no text", () => {
            doTest("/**\n * Description\n */\nfunction f() {}", "t\n\nu", "/**\n * t\n *\n * u\n */\nfunction f() {}");
        });

        it("should set a new single-line comment when originally single-line", () => {
            doTest("/** Description */function identifier() {}", "New", "/** New */function identifier() {}");
        });

        it("should set a new multi-line comment when originally single-line", () => {
            doTest("/** Description */function identifier() {}", "\nNew", "/**\n * New\n */function identifier() {}");
        });

        it("should set a new comment without affecting the tags", () => {
            doTest("/**\n * Description\n * @param - Something */function identifier() {}", "New",
                "/**\n * New\n * @param - Something */function identifier() {}");
        });

        it("should set a new comment without affecting the tags when the first tag has some space before it", () => {
            doTest("/**\n * Description\n *   @param - Something */function identifier() {}", "New",
                "/**\n * New\n *   @param - Something */function identifier() {}");
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
            doTest(text, ["@param test - Test\n * ", "@returns A value\n "]);
        });
    });

    describe(nameof<JSDoc>(d => d.insertTags), () => {
        function doTest(text: string, index: number, structures: OptionalKind<JSDocTagStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            const jsDoc = sourceFile.getFunctions()[0].getJsDocs()[0];
            const result = jsDoc.insertTags(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert when there are none", () => {
            doTest(
                "/**\n * Description\n */\nfunction test() {}",
                0,
                [{ tagName: "name" }],
                "/**\n * Description\n * @name\n */\nfunction test() {}",
            );
        });

        it("should change to multi-line when inserting and non exist", () => {
            doTest(
                "/** Description */\nfunction test() {}",
                0,
                [{ tagName: "name" }],
                "/**\n * Description\n * @name\n */\nfunction test() {}",
            );
        });

        it("should not modify description when inserting and the doc starts on the first line and spans multiple lines", () => {
            doTest(
                "/** Description\n * Other. */\nfunction test() {}",
                0,
                [{ tagName: "name" }],
                "/** Description\n * Other.\n * @name\n */\nfunction test() {}",
            );
        });

        it("should insert at the start", () => {
            doTest(
                "/**\n * Description\n * @name\n */\nfunction test() {}",
                0,
                [{ tagName: "other" }],
                "/**\n * Description\n * @other\n * @name\n */\nfunction test() {}",
            );
        });

        it("should insert in the middle", () => {
            doTest(
                "/**\n * Description\n * @name\n * @other\n */\nfunction test() {}",
                1,
                [{ tagName: "middle", text: "some description" }],
                "/**\n * Description\n * @name\n * @middle some description\n * @other\n */\nfunction test() {}",
            );
        });

        it("should insert at the end", () => {
            doTest(
                "/**\n * Description\n * @name\n */\nfunction test() {}",
                1,
                [{ tagName: "other" }],
                "/**\n * Description\n * @name\n * @other\n */\nfunction test() {}",
            );
        });

        it("should insert multiple", () => {
            doTest(
                "/**\n * Description\n * @other\n */\nfunction test() {}",
                0,
                [{ tagName: "name" }, { tagName: "test", text: "some text" }],
                "/**\n * Description\n * @name\n * @test some text\n * @other\n */\nfunction test() {}",
            );
        });
    });

    describe(nameof<JSDoc>(d => d.insertTag), () => {
        function doTest(text: string, index: number, structure: OptionalKind<JSDocTagStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            const jsDoc = sourceFile.getFunctions()[0].getJsDocs()[0];
            const result = jsDoc.insertTag(index, structure);
            expect(result.getKindName()).to.equal("JSDocTag");
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should insert", () => {
            doTest(
                "/**\n * Description\n * @name\n * @other\n */\nfunction test() {}",
                1,
                { tagName: "middle", text: "some description" },
                "/**\n * Description\n * @name\n * @middle some description\n * @other\n */\nfunction test() {}",
            );
        });
    });

    describe(nameof<JSDoc>(d => d.addTags), () => {
        function doTest(text: string, structures: OptionalKind<JSDocTagStructure>[], expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            const jsDoc = sourceFile.getFunctions()[0].getJsDocs()[0];
            const result = jsDoc.addTags(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add multiple", () => {
            doTest(
                "/**\n * Description\n * @name\n */\nfunction test() {}",
                [{ tagName: "test", text: "some text" }, { tagName: "other" }],
                "/**\n * Description\n * @name\n * @test some text\n * @other\n */\nfunction test() {}",
            );
        });
    });

    describe(nameof<JSDoc>(d => d.addTag), () => {
        function doTest(text: string, structure: OptionalKind<JSDocTagStructure>, expectedText: string) {
            const { sourceFile } = getInfoFromText(text);
            const jsDoc = sourceFile.getFunctions()[0].getJsDocs()[0];
            const result = jsDoc.addTag(structure);
            expect(result.getKindName()).to.equal("JSDocTag");
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add at the end", () => {
            doTest(
                "/**\n * Description\n * @name\n */\nfunction test() {}",
                { tagName: "other" },
                "/**\n * Description\n * @name\n * @other\n */\nfunction test() {}",
            );
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

        it("should not modify content's stars", () => {
            doTest("/** Performs `counter *= 2`.*/function identifier() {}", "Performs `counter *= 2`.");
            doTest("/**\nPerforms `counter *= 2`.\n*/function identifier() {}", "Performs `counter *= 2`.");
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

        it("should change description when multi-line", () => {
            doTest("/**\n * Test\n */\nclass Test {}", { description: "\nNew" }, "/**\n * New\n */\nclass Test {}");
        });

        it("should change description when single-line", () => {
            doTest("/**\n * Test\n */\nclass Test {}", { description: "New" }, "/** New */\nclass Test {}");
        });

        it("should change description when single-line", () => {
            doTest("/**\n * Test\n *\n */\nclass Test {}", { description: "New" }, "/** New */\nclass Test {}");
        });

        it("should set when has a blank line before the tags", () => {
            doTest(
                "/**\n * Test\n */\nclass t {}",
                {
                    kind: StructureKind.JSDoc,
                    description: "\nTest.\n",
                    tags: [{
                        tagName: "remarks",
                        text: "Testing.\n\nTest.",
                    }],
                },
                "/**\n * Test.\n *\n * @remarks Testing.\n *\n * Test.\n */\nclass t {}",
            );
        });
    });

    describe(nameof<JSDoc>(n => n.getStructure), () => {
        function doTest(text: string, expectedStructure: OptionalTrivia<MakeRequired<JSDocStructure>>) {
            const { sourceFile } = getInfoFromText(text);
            const structure = sourceFile.getFunctions()[0].getJsDocs()[0].getStructure();
            expect(structure).to.deep.equal(fillStructures.jsDoc(expectedStructure));
        }

        it("should get when has nothing", () => {
            doTest("/** */function t() {}", {
                kind: StructureKind.JSDoc,
                description: "",
                tags: [],
            });
        });

        it("should get when has everything", () => {
            doTest("/** Test\n * @param p - Testing\n */\nfunction t() {}", {
                kind: StructureKind.JSDoc,
                description: "Test",
                tags: [{
                    tagName: "param",
                    text: "p - Testing",
                }],
            });
        });

        it("should get when description has a blank line before tags", () => {
            doTest("/**\n * Test.\n *\n * @remarks Testing.\n *\n * Test.\n */\nfunction t() {}", {
                kind: StructureKind.JSDoc,
                description: "\nTest.\n",
                tags: [{
                    tagName: "remarks",
                    text: "Testing.\n\nTest.",
                }],
            });
        });
    });
});
