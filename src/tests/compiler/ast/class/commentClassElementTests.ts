import { expect } from "chai";
import { ClassDeclaration, CommentClassElement } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(CommentClassElement), () => {
    describe(nameof<CommentClassElement>(c => c.remove), () => {
        function doTest(startCode: string, index: number, expectedCode: string) {
            const { firstChild, sourceFile } = getInfoFromText<ClassDeclaration>(startCode);
            firstChild.getMembersWithComments()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove a comment when it's the only member", () => {
            doTest("class c {\n    // test\n}", 0, "class c {\n}");
        });

        it("should remove a prop", () => {
            doTest("class c {\n    uuuuuu;\n    p;\n}", 0, "class c {\n    p;\n}");
        });

        it("should remove a comment at the start", () => {
            doTest("class c {\n    // test\n    p;\n}", 0, "class c {\n    p;\n}");
        });

        it("should remove a comment in the middle", () => {
            doTest("class c {\n    p;\n    // test\n    u;\n}", 1, "class c {\n    p;\n    u;\n}");
        });

        it("should remove a comment at the end", () => {
            doTest("class c {\n    p;\n    // test\n}", 1, "class c {\n    p;\n}");
        });
    });
});
