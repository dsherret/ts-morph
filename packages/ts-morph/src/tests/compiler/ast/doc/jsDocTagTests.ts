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
    });
});
