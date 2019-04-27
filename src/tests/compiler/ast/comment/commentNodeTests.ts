import { expect } from "chai";
import { CommentStatement } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";

describe("general comment node tests", () => {
    it("should not forget comments between manipulations", () => {
        const { sourceFile } = getInfoFromText("//1\nlet t;\n/*2*/");
        const statements = sourceFile.getStatementsWithComments();
        expect(statements.length).to.equal(3);
        sourceFile.addClass({ name: "test" });
        expect(statements.some(s => s.wasForgotten())).to.be.false;
    });

    describe(nameof<CommentStatement>(c => c.getLeadingCommentRanges), () => {
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

    describe(nameof<CommentStatement>(c => c.getTrailingCommentRanges), () => {
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
