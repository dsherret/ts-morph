import * as ts from "typescript";
import {expect} from "chai";
import {Node, EnumDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(Node), () => {
    describe(nameof<Node<any>>(n => n.getCompilerNode), () => {
        it("should get the underlying compiler node", () => {
            const {sourceFile} = getInfoFromText("enum MyEnum {}\n");
            // just compare that the texts are the same
            expect(sourceFile.getFullText()).to.equal(sourceFile.getCompilerNode().getFullText());
        });
    });

    describe(nameof<Node<any>>(n => n.getKind), () => {
        it("should return the syntax kind", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getKind()).to.equal(ts.SyntaxKind.EnumDeclaration);
        });
    });

    describe(nameof<Node<any>>(n => n.getKindName), () => {
        it("should return the syntax kind name", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getKindName()).to.equal("EnumDeclaration");
        });
    });

    describe(nameof<Node<any>>(n => n.containsRange), () => {
        const {firstChild} = getInfoFromText("enum MyEnum {}");
        it("should contain the range when equal to the pos and end", () => {
            expect(firstChild.containsRange(firstChild.getPos(), firstChild.getEnd())).to.be.true;
        });

        it("should contain the range when inside", () => {
            expect(firstChild.containsRange(firstChild.getPos() + 1, firstChild.getEnd() - 1)).to.be.true;
        });

        it("should not contain the range when the position is outside", () => {
            expect(firstChild.containsRange(firstChild.getPos() - 1, firstChild.getEnd())).to.be.false;
        });

        it("should not contain the range when the end is outside", () => {
            expect(firstChild.containsRange(firstChild.getPos(), firstChild.getEnd() + 1)).to.be.false;
        });
    });

    describe(nameof<Node<any>>(n => n.offsetPositions), () => {
        const {sourceFile} = getInfoFromText("enum MyEnum {}");
        const allNodes = [sourceFile, ...Array.from(sourceFile.getAllChildren())];

        // easiest to just compare the sum of the positions
        const originalStartPosSum = allNodes.map(n => n.getPos()).reduce((a, b) => a + b, 0);
        const originalEndPosSum = allNodes.map(n => n.getEnd()).reduce((a, b) => a + b, 0);
        it("should offset all the positions", () => {
            sourceFile.offsetPositions(5);
            const adjustedStartPosSum = allNodes.map(n => n.getPos() - 5).reduce((a, b) => a + b, 0);
            const adjustedEndPosSum = allNodes.map(n => n.getEnd() - 5).reduce((a, b) => a + b, 0);
            expect(adjustedStartPosSum).to.equal(originalStartPosSum);
            expect(adjustedEndPosSum).to.equal(originalEndPosSum);
        });
    });

    describe(nameof<Node<any>>(n => n.getFirstChildByKind), () => {
        const {firstChild} = getInfoFromText("enum MyEnum {}");

        it("should return the first node of the specified syntax kind", () => {
            expect(firstChild.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken)!.getText()).to.equal("{");
        });

        it("should return null when the specified syntax kind doesn't exist", () => {
            expect(firstChild.getFirstChildByKind(ts.SyntaxKind.ClassDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node<any>>(n => n.isSourceFile), () => {
        const {sourceFile, firstChild} = getInfoFromText("enum MyEnum {}");
        it("should return true for the source file", () => {
            expect(sourceFile.isSourceFile()).to.be.true;
        });

        it("should return false for something not a source file", () => {
            expect(firstChild.isSourceFile()).to.be.false;
        });
    });

    describe(nameof<Node<any>>(n => n.getNotImplementedError), () => {
        it("should return the not implemented error", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {}");
            const error = firstChild.getNotImplementedError();
            expect(error.message).to.equal("Not implemented feature for syntax kind 'EnumDeclaration'.");
        });
    });

    describe(nameof<Node<any>>(n => n.getNotImplementedMessage), () => {
        it("should return the not implemented message", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getNotImplementedMessage()).to.equal("Not implemented feature for syntax kind 'EnumDeclaration'.");
        });
    });

    describe(nameof<Node<any>>(n => n.getIndentationText), () => {
        it("should return a blank string when it's at the start of the file", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {\n}\n");
            expect(firstChild.getIndentationText()).to.equal("");
        });

        it("should return a blank string when it's at the start of a line", () => {
            const {firstChild} = getInfoFromText("\r\n\nenum MyEnum {\n}\n");
            expect(firstChild.getIndentationText()).to.equal("");
        });

        it("should return the indentation text when it's spaces", () => {
            const {firstChild} = getInfoFromText("    enum MyEnum {\n}\n");
            expect(firstChild.getIndentationText()).to.equal("    ");
        });

        it("should return the indentation text when it includes tabs", () => {
            const {firstChild} = getInfoFromText("\n    \tenum MyEnum {\n}\n");
            expect(firstChild.getIndentationText()).to.equal("    \t");
        });

        it("should go up to the comment", () => {
            const {firstChild} = getInfoFromText("\n  /* comment */  \tenum MyEnum {\n}\n");
            expect(firstChild.getIndentationText()).to.equal("  ");
        });
    });

    describe(nameof<Node<any>>(n => n.getStartLinePos), () => {
        it("should return the start of the file when it's on the first line", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {\n}\n");
            expect(firstChild.getStartLinePos()).to.equal(0);
        });

        it("should return the start of the file when it's on the first line", () => {
            const {firstChild} = getInfoFromText("    enum MyEnum {\n}\n");
            expect(firstChild.getStartLinePos()).to.equal(0);
        });

        it("should return the start of the line when it's not on the first line", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum {\n    myMember = 1\n}\n");
            const memberDeclaration = firstChild.getMembers()[0];
            expect(memberDeclaration.getStartLinePos()).to.equal(14);
        });

        it("should return the start of the line when the past line is a \\r\\n", () => {
            const {firstChild} = getInfoFromText("\n  \t  \r\nenum MyEnum {\n}\n");
            expect(firstChild.getStartLinePos()).to.equal(8);
        });
    });

    describe(nameof<Node<any>>(n => n.getStart), () => {
        it("should return the pos without trivia", () => {
            const {firstChild} = getInfoFromText("\n  \t  /* comment */ //comment  \r\n  \t enum MyEnum {\n}\n");
            expect(firstChild.getStart()).to.equal(37);
        });
    });
});
