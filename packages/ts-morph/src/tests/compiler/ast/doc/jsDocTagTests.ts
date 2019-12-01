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
