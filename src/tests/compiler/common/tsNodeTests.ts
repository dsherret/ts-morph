import {expect} from "chai";
import {TsNode, TsEnumDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TsNode), () => {
    describe(nameof<TsNode<any>>(n => n.insertText), () => {
        describe("adding a source file child", () => {
            const {tsSourceFile, tsFirstChild} = getInfoFromText("    ");
            tsSourceFile.insertText(2, "  enum MyEnum {}  ");
            it("should update the source file text", () => {
                expect(tsSourceFile.getFullText()).to.equal("    enum MyEnum {}    ");
            });
        });

        describe("adding a child", () => {
            const {tsSourceFile, tsFirstChild} = getInfoFromText("enum MyEnum {}");
            tsSourceFile.insertText(13, "\n    myNewMember\n");
            it("should update the source file text", () => {
                expect(tsSourceFile.getFullText()).to.equal("enum MyEnum {\n    myNewMember\n}");
            });
        });
    });

    describe(nameof<TsNode<any>>(n => n.isSourceFile), () => {
        const {tsSourceFile, tsFirstChild} = getInfoFromText("enum MyEnum {}");
        it("should return true for the source file", () => {
            expect(tsSourceFile.isSourceFile()).to.be.true;
        });

        it("should return false for something not a source file", () => {
            expect(tsFirstChild.isSourceFile()).to.be.false;
        });
    });

    describe(nameof<TsNode<any>>(n => n.getNotImplementedError), () => {
        it("should return the not implemented error", () => {
            const {tsFirstChild} = getInfoFromText("enum MyEnum {}");
            const error = tsFirstChild.getNotImplementedError();
            expect(error.message).to.equal("Not implemented feature for syntax kind 'EnumDeclaration'.");
        });
    });

    describe(nameof<TsNode<any>>(n => n.getNotImplementedMessage), () => {
        it("should return the not implemented message", () => {
            const {tsFirstChild} = getInfoFromText("enum MyEnum {}");
            expect(tsFirstChild.getNotImplementedMessage()).to.equal("Not implemented feature for syntax kind 'EnumDeclaration'.");
        });
    });

    describe(nameof<TsNode<any>>(n => n.getKindName), () => {
        it("should return the syntax kind name", () => {
            const {tsFirstChild} = getInfoFromText("enum MyEnum {}");
            expect(tsFirstChild.getKindName()).to.equal("EnumDeclaration");
        });
    });

    describe(nameof<TsNode<any>>(n => n.getIndentationText), () => {
        it("should return a blank string when it's at the start of the file", () => {
            const {tsFirstChild} = getInfoFromText("enum MyEnum {\n}\n");
            expect(tsFirstChild.getIndentationText()).to.equal("");
        });

        it("should return a blank string when it's at the start of a line", () => {
            const {tsFirstChild} = getInfoFromText("\r\n\nenum MyEnum {\n}\n");
            expect(tsFirstChild.getIndentationText()).to.equal("");
        });

        it("should return the indentation text when it's spaces", () => {
            const {tsFirstChild} = getInfoFromText("    enum MyEnum {\n}\n");
            expect(tsFirstChild.getIndentationText()).to.equal("    ");
        });

        it("should return the indentation text when it includes tabs", () => {
            const {tsFirstChild} = getInfoFromText("\n    \tenum MyEnum {\n}\n");
            expect(tsFirstChild.getIndentationText()).to.equal("    \t");
        });

        it("should go up to the comment", () => {
            const {tsFirstChild} = getInfoFromText("\n  /* comment */  \tenum MyEnum {\n}\n");
            expect(tsFirstChild.getIndentationText()).to.equal("  ");
        });
    });

    describe(nameof<TsNode<any>>(n => n.getStartLinePos), () => {
        it("should return the start of the file when it's on the first line", () => {
            const {tsFirstChild} = getInfoFromText("enum MyEnum {\n}\n");
            expect(tsFirstChild.getStartLinePos()).to.equal(0);
        });

        it("should return the start of the file when it's on the first line", () => {
            const {tsFirstChild} = getInfoFromText("    enum MyEnum {\n}\n");
            expect(tsFirstChild.getStartLinePos()).to.equal(0);
        });

        it("should return the start of the line when it's not on the first line", () => {
            const {tsFirstChild} = getInfoFromText("enum MyEnum {\n    myMember = 1\n}\n");
            const memberDeclaration = (tsFirstChild as TsEnumDeclaration).getMembers()[0];
            expect(memberDeclaration.getStartLinePos()).to.equal(14);
        });

        it("should return the start of the line when the past line is a \\r\\n", () => {
            const {tsFirstChild} = getInfoFromText("\n  \t  \r\nenum MyEnum {\n}\n");
            expect(tsFirstChild.getStartLinePos()).to.equal(8);
        });
    });

    describe(nameof<TsNode<any>>(n => n.getStart), () => {
        it("should return the pos without trivia", () => {
            const {tsFirstChild} = getInfoFromText("\n  \t  /* comment */ //comment  \r\n  \t enum MyEnum {\n}\n");
            expect(tsFirstChild.getStart()).to.equal(37);
        });
    });
});
