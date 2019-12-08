import { expect } from "chai";
import { JSDocTag, Node } from "../../../../compiler";
import { getInfoFromText, fillStructures, OptionalKindAndTrivia } from "../../testHelpers";
import { JSDocTagStructure } from "../../../../structures";

describe(nameof(JSDocTag), () => {
    function getInfo(text: string) {
        const info = getInfoFromText(text);
        return { descendant: info.sourceFile.getFirstDescendantOrThrow(Node.isJSDocTag), ...info };
    }

    describe(nameof<JSDocTag>(d => d.getTagName), () => {
        it("should get the tag name", () => {
            const { descendant } = getInfo("/** @param t - String */\nfunction test() {}");
            expect(descendant.getTagName()).to.equal("param");
        });
    });

    describe(nameof<JSDocTag>(d => d.getTagNameNode), () => {
        it("should get the tag name node", () => {
            const { descendant } = getInfo("/** @param t - String */\nfunction test() {}");
            expect(descendant.getTagNameNode().getText()).to.equal("param");
        });
    });

    describe(nameof<JSDocTag>(d => d.setTagName), () => {
        it("should set the tag name", () => {
            const { sourceFile, descendant } = getInfo("/** @param t - String */\nfunction test() {}");
            descendant.setTagName("other");
            expect(descendant.wasForgotten()).to.be.true;
            expect(sourceFile.getFullText()).to.equal("/** @other t - String */\nfunction test() {}");
        });

        it("should not forget the current node when providing the same tag name", () => {
            const { sourceFile, descendant } = getInfo("/** @param t - String */\nfunction test() {}");
            descendant.setTagName("param");
            expect(descendant.wasForgotten()).to.be.false;
            expect(sourceFile.getFullText()).to.equal("/** @param t - String */\nfunction test() {}");
        });
    });

    describe(nameof<JSDocTag>(d => d.getComment), () => {
        function doTest(text: string, expected: string | undefined) {
            const { descendant } = getInfo(text);
            expect(descendant.getComment()).to.equal(expected);
        }

        it("should get the tag comment", () => {
            doTest("/** @param t - String*/\nfunction test() {}", "- String");
        });

        it("should return undefined when not exists", () => {
            doTest("/** @param */\nfunction test() {}", undefined);
        });
    });

    describe(nameof<JSDocTag>(n => n.remove), () => {
        function doTest(text: string, index: number, expected: string) {
            const { sourceFile } = getInfoFromText(text);
            const descendant = sourceFile.getDescendants().filter(Node.isJSDocTag)[index];
            descendant.remove();
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should remove the tag comment when it is the only one and on the first line", () => {
            doTest(
                "/** @param t - String */\nfunction test() {}",
                0,
                "/***/\nfunction test() {}"
            );
        });

        it("should remove the tag comment when it is the only one and on the second line", () => {
            doTest(
                "/**\n * @param t - String */\nfunction test() {}",
                0,
                "/***/\nfunction test() {}"
            );
        });

        it("should remove the tag comment when it is the only one and has a description", () => {
            doTest(
                "/**\n * Description.\n * @param t - String\n */\nfunction test() {}",
                0,
                "/**\n * Description.\n */\nfunction test() {}"
            );
        });

        it("should remove the tag comment at the start", () => {
            doTest(
                "/**\n * @param t - String\n * @param u\n */\nfunction test() {}",
                0,
                "/**\n * @param u\n */\nfunction test() {}"
            );
        });

        it("should remove the tag comment in the middle", () => {
            doTest(
                "/**\n * @param t - String\n * @param u\n * @param v\n */\nfunction test() {}",
                1,
                "/**\n * @param t - String\n * @param v\n */\nfunction test() {}"
            );
        });

        it("should remove the tag comment at the end", () => {
            doTest(
                "/**\n * @param t - String\n * @param u\n */\nfunction test() {}",
                1,
                "/**\n * @param t - String\n */\nfunction test() {}"
            );
        });

        it("should remove the tag comment at the start when on the same line as the start", () => {
            doTest(
                "/** @param t - String\n * @param u\n */\nfunction test() {}",
                0,
                "/**\n * @param u\n */\nfunction test() {}"
            );
        });

        it("should remove the tag comment at the end when previous is at the start", () => {
            // todo: make this better
            doTest(
                "/** @param t - String\n * @param u\n */\nfunction test() {}",
                1,
                "/** @param t - String\n */\nfunction test() {}"
            );
        });

        it("should handle indented code", () => {
            doTest(
                "function test() {\n    /**\n     * @param t - String\n     * @param u\n     */\nfunction test() {} }",
                0,
                "function test() {\n    /**\n     * @param u\n     */\nfunction test() {} }"
            );
        });

        it("should remove the tag comment at the start when not a param comment", () => {
            doTest(
                "/**\n * @example - String\n * @example other\n *\n testing\n */\nfunction test() {}",
                0,
                "/**\n * @example other\n *\n testing\n */\nfunction test() {}"
            );
        });

        it("should remove the tag comment in the middle when not a param comment", () => {
            // compiler has bugs where it doesn't set the width property (TS issue #35455)
            doTest(
                "/**\n * @example - String\n * @example other\n *\n testing\n * @example testing\n */\nfunction test() {}",
                1,
                "/**\n * @example - String\n * @example testing\n */\nfunction test() {}"
            );
        });

        it("should remove the tag comment at the end when not a param comment", () => {
            doTest(
                "/**\n * @example - String\n * @example other\n *\n testing\n */\nfunction test() {}",
                1,
                "/**\n * @example - String\n */\nfunction test() {}"
            );
        });
    });

    describe(nameof<JSDocTag>(d => d.set), () => {
        function doTest(text: string, structure: Partial<JSDocTagStructure>, expectedText: string) {
            const { sourceFile, descendant } = getInfo(text);
            descendant.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should set to a different tag name", () => {
            doTest("/** @param */\nfunction test() {}", { tagName: "other" }, "/** @other */\nfunction test() {}");
        });

        it("should add text", () => {
            doTest("/** @param */\nfunction test() {}", { text: "t - test" }, "/** @param t - test */\nfunction test() {}");
        });

        it("should set to a different text", () => {
            doTest("/** @param - other */\nfunction test() {}", { text: "t - test" }, "/** @param t - test */\nfunction test() {}");
        });

        it("should set multi-line text", () => {
            doTest(
                "/** @param - other */\nfunction test() {}",
                { tagName: "asdf", text: "t - test\nOther." },
                "/** @asdf t - test\n * Other. */\nfunction test() {}"
            );
        });

        it("should set to a different tag name and text when no text exists", () => {
            doTest(
                "/** @param */\nfunction test() {}",
                { tagName: "other", text: "asdf testing" },
                "/** @other asdf testing */\nfunction test() {}"
            );
        });

        it("should set to a different tag name and text", () => {
            doTest(
                "/**\n * @param testing this\n */\nfunction test() {}",
                { tagName: "other", text: "asdf testing" },
                "/**\n * @other asdf testing\n */\nfunction test() {}"
            );
        });

        it("should set to a different tag name and text (reversed)", () => {
            doTest(
                "/**\n * @other asdf testing\n */\nfunction test() {}",
                { tagName: "param", text: "testing this" },
                "/**\n * @param testing this\n */\nfunction test() {}"
            );
        });

        it("should allow setting text immediately on a new line", () => {
            doTest(
                "/**\n * @example\n */\nfunction test() {}",
                { text: "\ntesting this" },
                "/**\n * @example\n * testing this\n */\nfunction test() {}"
            );
        });
    });

    describe(nameof<JSDocTag>(d => d.getStructure), () => {
        function doTest(text: string, expected: OptionalKindAndTrivia<MakeRequired<JSDocTagStructure>>) {
            const { descendant } = getInfo(text);
            expect(descendant.getStructure()).to.deep.equal(fillStructures.jsDocTag(expected));
        }

        it("should get when there is no text following the tag name", () => {
            doTest("/** @param */\nfunction test() {}", { tagName: "param", text: undefined });
        });

        it("should get when there is text following the tag name", () => {
            doTest("/** @param t - Test */\nfunction test() {}", { tagName: "param", text: "t - Test" });
        });

        it("should get when there is multi-line text following the tag name", () => {
            doTest("/** @param t - Test\n * Other. */\nfunction test() {}", { tagName: "param", text: "t - Test\nOther." });
        });

        it("should get the text for non-param tags", () => {
            // necessary because of inconsistencies with js doc tag with in the compiler
            doTest("/** @example Something\n * Other. */\nfunction test() {}", { tagName: "example", text: "Something\nOther." });
        });

        it("should get if the text starts with a new line", () => {
            // necessary because of inconsistencies with js doc tag with in the compiler
            doTest("/** @example\n * Something\n * Other. */\nfunction test() {}", { tagName: "example", text: "\nSomething\nOther." });
        });
    });
});
