import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { ObjectLiteralExpression, CommentObjectLiteralElement } from "../../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../../testHelpers";

describe(nameof(CommentObjectLiteralElement), () => {
    describe(nameof<CommentObjectLiteralElement>(c => c.remove), () => {
        function doTest(startCode: string, index: number, expectedCode: string) {
            const { descendant, sourceFile } = getInfoFromTextWithDescendant<ObjectLiteralExpression>(startCode, SyntaxKind.ObjectLiteralExpression);
            descendant.getPropertiesWithComments()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should remove a comment when it's the only member", () => {
            doTest("const o = {\n    // test\n}", 0, "const o = {\n}");
        });

        it("should remove a prop", () => {
            doTest("const o = {\n    uuuuuu,\n    p\n}", 0, "const o = {\n    p\n}");
        });

        it("should remove a comment at the start", () => {
            doTest("const o = {\n    // test\n    p\n}", 0, "const o = {\n    p\n}");
        });

        it("should remove a comment in the middle", () => {
            doTest("const o = {\n    p,\n    // test\n    u\n}", 1, "const o = {\n    p,\n    u\n}");
        });

        it("should remove a comment at the end", () => {
            doTest("const o = {\n    p\n    // test\n}", 1, "const o = {\n    p\n}");
        });
    });
});
