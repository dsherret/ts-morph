import { SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { CommentRange } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(CommentRange), () => {
    const comments = getInfoFromText("// first\n/* second */var t = 0;").firstChild.getLeadingCommentRanges();
    const [singleLineComment, multiLineComment] = comments;

    describe("single line comment", () => {
        it("should have the correct kind", () => {
            expect(singleLineComment.getKind()).to.equal(SyntaxKind.SingleLineCommentTrivia);
        });

        it("should have the correct pos", () => {
            expect(singleLineComment.getPos()).to.equal(0);
        });

        it("should have the correct end", () => {
            expect(singleLineComment.getEnd()).to.equal(8);
        });

        it("should have the correct width", () => {
            expect(singleLineComment.getWidth()).to.equal(8);
        });

        it("should have the correct text", () => {
            expect(singleLineComment.getText()).to.equal("// first");
        });
    });

    describe("multi line comment", () => {
        it("should have the correct kind", () => {
            expect(multiLineComment.getKind()).to.equal(SyntaxKind.MultiLineCommentTrivia);
        });

        it("should have the correct pos", () => {
            expect(multiLineComment.getPos()).to.equal(9);
        });

        it("should have the correct end", () => {
            expect(multiLineComment.getEnd()).to.equal(21);
        });

        it("should have the correct width", () => {
            expect(multiLineComment.getWidth()).to.equal(12);
        });

        it("should have the correct text", () => {
            expect(multiLineComment.getText()).to.equal("/* second */");
        });
    });
});
