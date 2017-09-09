import {expect} from "chai";
import {JSDoc} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(JSDoc), () => {
    describe(nameof<JSDoc>(d => d.remove), () => {
        function doTest(text: string, index: number, jsDocIndex: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getFunctions()[index].getDocumentationCommentNodes()[jsDocIndex].remove();
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
});
