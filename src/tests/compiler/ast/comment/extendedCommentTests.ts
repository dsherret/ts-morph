import { expect } from "chai";
import { ExtendedComment } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ExtendedComment), () => {
    describe(nameof<ExtendedComment>(c => c.getLeadingCommentRanges), () => {
        function doTest(text: string, index: number, expectedComments: string[]) {
            const { sourceFile } = getInfoFromText(text);
            const secondComment = sourceFile.getStatementsWithComments()[index];
            const commentRanges = secondComment.getLeadingCommentRanges();
            expect(commentRanges.map(r => r.getText())).to.deep.equal(expectedComments);
        }

        it("should get the leading comment ranges", () => {
            doTest("/*1*/ //2\n/*3*/ //4", 1, ["/*1*/", "//2"]);
        });

        it("should get the leading comment ranges when surrounded by nodes", () => {
            doTest("let a;\n/*1*/ //2\n/*3*/ //4\nlet b;", 2, ["/*1*/", "//2"]);
        });
    });

    describe(nameof<ExtendedComment>(c => c.getTrailingCommentRanges), () => {
        function doTest(text: string, index: number, expectedComments: string[]) {
            const { sourceFile } = getInfoFromText(text);
            const secondComment = sourceFile.getStatementsWithComments()[index];
            const commentRanges = secondComment.getTrailingCommentRanges();
            expect(commentRanges.map(r => r.getText())).to.deep.equal(expectedComments);
        }

        it("should get the trailing trivia", () => {
            doTest("/*1*/ /*2*/ //3\n/*4*/", 0, ["/*2*/", "//3"]);
        });
    });
});
