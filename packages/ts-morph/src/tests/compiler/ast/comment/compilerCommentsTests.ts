import { SyntaxKind, ts } from "@ts-morph/common";
import { expect } from "chai";
import { CompilerCommentNode, CompilerCommentStatement } from "../../../../compiler";
import { getInfoFromText } from "../../testHelpers";
describe(nameof(CompilerCommentNode), () => {
    interface ExpectedResult {
        pos: number;
        end: number;
        kind: SyntaxKind;
        flags: ts.NodeFlags;
        parent: ts.Node;
        sourceFile: ts.SourceFile;
        start: number;
        fullStart: number;
        width: number;
        fullWidth: number;
        leadingTriviaWidth: number;
        fullText: string;
        text: string;
    }

    function runTests(comment: CompilerCommentNode, expected: ExpectedResult) {
        it("should have the correct pos", () => {
            expect(comment.pos).to.equal(expected.pos);
        });

        it("should have the correct end", () => {
            expect(comment.end).to.equal(expected.end);
        });

        it("should have the correct kind", () => {
            expect(comment.kind).to.equal(expected.kind);
        });

        it("should have the correct flags", () => {
            expect(comment.flags).to.equal(expected.flags);
        });

        it("should have the correct parent", () => {
            expect(comment.parent).to.equal(expected.parent);
        });

        it("should have the correct sourceFile", () => {
            expect(comment.getSourceFile()).to.equal(expected.sourceFile);
        });

        it("should have a child count of 0", () => {
            expect(comment.getChildCount()).to.equal(0);
        });

        it("should return undefined when getting the child at an index", () => {
            expect(comment.getChildAt(0)).to.be.undefined;
        });

        it("should have no children", () => {
            expect(comment.getChildren().length).to.equal(0);
        });

        it("should have the correct start", () => {
            expect(comment.getStart()).to.equal(expected.start);
        });

        it("should have the correct full start", () => {
            expect(comment.getFullStart()).to.equal(expected.fullStart);
        });

        it("should have the correct width", () => {
            expect(comment.getWidth()).to.equal(expected.width);
        });

        it("should have the correct full width", () => {
            expect(comment.getFullWidth()).to.equal(expected.fullWidth);
        });

        it("should have the correct leading trivia width", () => {
            expect(comment.getLeadingTriviaWidth()).to.equal(expected.leadingTriviaWidth);
        });

        it("should have the correct full text", () => {
            expect(comment.getFullText()).to.equal(expected.fullText);
        });

        it("should have the correct text", () => {
            expect(comment.getText()).to.equal(expected.text);
        });

        it("should have the correct getEnd", () => {
            expect(comment.getEnd()).to.equal(expected.end);
        });

        it("should return undefined for the first token", () => {
            expect(comment.getFirstToken()).to.be.undefined;
        });

        it("should return undefined for the last token", () => {
            expect(comment.getLastToken()).to.be.undefined;
        });

        it("should return undefined when calling forEachChild", () => {
            expect(comment.forEachChild(() => 3)).to.be.undefined;
        });
    }

    describe("single line comment", () => {
        const sourceFile = getInfoFromText("  //a ").sourceFile;
        const comment = sourceFile.getStatementsWithComments()[0].compilerNode as CompilerCommentStatement as CompilerCommentNode;

        runTests(comment, {
            pos: 2,
            end: 6,
            fullStart: 0,
            flags: ts.NodeFlags.None,
            fullText: "  //a ",
            fullWidth: 6,
            width: 4,
            kind: SyntaxKind.SingleLineCommentTrivia,
            leadingTriviaWidth: 2,
            parent: sourceFile.compilerNode,
            sourceFile: sourceFile.compilerNode,
            start: 2,
            text: "//a "
        });
    });

    describe("multi line comment", () => {
        const sourceFile = getInfoFromText("  /*1*/ ").sourceFile;
        const comment = sourceFile.getStatementsWithComments()[0].compilerNode as CompilerCommentStatement as CompilerCommentNode;

        runTests(comment, {
            pos: 2,
            end: 7,
            fullStart: 0,
            flags: ts.NodeFlags.None,
            fullText: "  /*1*/",
            fullWidth: 7,
            width: 5,
            kind: SyntaxKind.MultiLineCommentTrivia,
            leadingTriviaWidth: 2,
            parent: sourceFile.compilerNode,
            sourceFile: sourceFile.compilerNode,
            start: 2,
            text: "/*1*/"
        });
    });
});
