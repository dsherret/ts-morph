import {expect} from "chai";
import {Node, EnumDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(Node), () => {
    describe(nameof<Node<any>>(n => n.insertText), () => {
        describe("adding a source file child", () => {
            const {sourceFile, firstChild} = getInfoFromText("    ");
            sourceFile.insertText(2, "  enum MyEnum {}  ");
            it("should update the source file text", () => {
                expect(sourceFile.getFullText()).to.equal("    enum MyEnum {}    ");
            });
        });

        describe("adding a child", () => {
            const {sourceFile, firstChild} = getInfoFromText("enum MyEnum {}");
            sourceFile.insertText(13, "\n    myNewMember\n");
            it("should update the source file text", () => {
                expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    myNewMember\n}");
            });
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

    describe(nameof<Node<any>>(n => n.getKindName), () => {
        it("should return the syntax kind name", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getKindName()).to.equal("EnumDeclaration");
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
