import {expect} from "chai";
import {TsNode, TsEnumDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(TsNode), () => {
    describe(nameof<TsNode<any>>(n => n.getIndentationText), () => {
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

    describe(nameof<TsNode<any>>(n => n.getPosWithoutTrivia), () => {
        it("should return the pos without trivia", () => {
            const {tsFirstChild} = getInfoFromText("\n  \t  /* comment */ //comment  \r\n  \t enum MyEnum {\n}\n");
            expect(tsFirstChild.getPosWithoutTrivia()).to.equal(37);
        });
    });
});
