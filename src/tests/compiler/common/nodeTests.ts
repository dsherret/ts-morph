import * as ts from "typescript";
import {expect} from "chai";
import {Node, EnumDeclaration, ClassDeclaration, FunctionDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(Node), () => {
    describe(nameof<Node>(n => n.compilerNode), () => {
        it("should get the underlying compiler node", () => {
            const {sourceFile} = getInfoFromText("enum MyEnum {}\n");
            // just compare that the texts are the same
            expect(sourceFile.getFullText()).to.equal(sourceFile.compilerNode.getFullText());
        });

        it("should throw an error when using a removed node", () => {
            const {firstChild} = getInfoFromText<EnumDeclaration>("enum MyEnum { member }\n");
            const member = firstChild.getMembers()[0];
            member.remove();
            expect(() => member.compilerNode).to.throw();
        });
    });

    describe(nameof<Node>(n => n.getKind), () => {
        it("should return the syntax kind", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getKind()).to.equal(ts.SyntaxKind.EnumDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getKindName), () => {
        it("should return the syntax kind name", () => {
            const {firstChild} = getInfoFromText("enum MyEnum {}");
            expect(firstChild.getKindName()).to.equal("EnumDeclaration");
        });
    });

    describe(nameof<Node>(n => n.containsRange), () => {
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

    describe(nameof<Node>(n => n.offsetPositions), () => {
        const {sourceFile} = getInfoFromText("enum MyEnum {}");
        const allNodes = [sourceFile, ...sourceFile.getDescendants()];

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

    describe(nameof<Node>(n => n.getFirstChildByKind), () => {
        const {firstChild} = getInfoFromText("enum MyEnum {}");

        it("should return the first node of the specified syntax kind", () => {
            expect(firstChild.getFirstChildByKind(ts.SyntaxKind.OpenBraceToken)!.getText()).to.equal("{");
        });

        it("should return null when the specified syntax kind doesn't exist", () => {
            expect(firstChild.getFirstChildByKind(ts.SyntaxKind.ClassDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getChildAtPos), () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() { const v = 5; }");
        const syntaxList = sourceFile.getChildSyntaxList()!;
        const variableStatement = firstChild.getVariableStatements()[0];

        it("should return undefined when providing a value less than the node pos", () => {
            expect(syntaxList.getChildAtPos(sourceFile.getPos() - 1)).to.be.undefined;
        });

        it("should return undefined when providing a value equal to the end", () => {
            expect(syntaxList.getChildAtPos(sourceFile.getEnd())).to.be.undefined;
        });

        it("should return the child at the specified position", () => {
            expect(syntaxList.getChildAtPos(1)!.getKind()).to.equal(ts.SyntaxKind.FunctionDeclaration);
        });

        it("should return only a child and not a descendant", () => {
            expect(syntaxList.getChildAtPos(variableStatement.getPos())!.getKind()).to.equal(ts.SyntaxKind.FunctionDeclaration);
        });
    });

    describe(nameof<Node>(n => n.getDescendantAtPos), () => {
        const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>("function myFunction() { const v = 5; }");
        const variableStatement = firstChild.getVariableStatements()[0];

        it("should return undefined when providing a value less than the pos", () => {
            expect(sourceFile.getDescendantAtPos(sourceFile.getPos() - 1)).to.be.undefined;
        });

        it("should return undefined when providing a value equal to the end", () => {
            expect(sourceFile.getDescendantAtPos(sourceFile.getEnd())).to.be.undefined;
        });

        it("should return the descendant at the specified position", () => {
            expect(sourceFile.getDescendantAtPos(1)!.getKind()).to.equal(ts.SyntaxKind.FunctionKeyword);
        });

        it("should return a very descendant descendant", () => {
            expect(sourceFile.getDescendantAtPos(variableStatement.getPos())!.getKind()).to.equal(ts.SyntaxKind.ConstKeyword);
        });

        it("should return a the node at the specified pos when specifying a space", () => {
            expect(sourceFile.getDescendantAtPos(variableStatement.getPos() - 1)!.getKind()).to.equal(ts.SyntaxKind.FirstPunctuation);
        });
    });

    describe(nameof<Node>(n => n.isSourceFile), () => {
        const {sourceFile, firstChild} = getInfoFromText("enum MyEnum {}");
        it("should return true for the source file", () => {
            expect(sourceFile.isSourceFile()).to.be.true;
        });

        it("should return false for something not a source file", () => {
            expect(firstChild.isSourceFile()).to.be.false;
        });
    });

    describe(nameof<Node>(n => n.getIndentationText), () => {
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

    describe(nameof<Node>(n => n.getStartLinePos), () => {
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

    describe(nameof<Node>(n => n.getStart), () => {
        it("should return the pos without trivia", () => {
            const {firstChild} = getInfoFromText("\n  \t  /* comment */ //comment  \r\n  \t enum MyEnum {\n}\n");
            expect(firstChild.getStart()).to.equal(37);
        });
    });

    describe(nameof<Node>(n => n.getCombinedModifierFlags), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier {}");
        it("should get the combined modifier flags", () => {
            expect(firstChild.getCombinedModifierFlags()).to.equal(ts.ModifierFlags.Export);
        });
    });

    describe(nameof<Node>(n => n.getParentIfKind), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier { prop: string; }");
        const child = firstChild.getInstanceProperty("prop")!;

        it("should get the parent when it's the right kind", () => {
            expect(child.getParentIfKind(ts.SyntaxKind.ClassDeclaration)).to.not.be.undefined;
        });

        it("should not get the parent when it's not the right kind", () => {
            expect(child.getParentIfKind(ts.SyntaxKind.InterfaceDeclaration)).to.be.undefined;
        });
    });

    describe(nameof<Node>(n => n.getParentIfKindOrThrow), () => {
        const {firstChild} = getInfoFromText<ClassDeclaration>("export class Identifier { prop: string; }");
        const child = firstChild.getInstanceProperty("prop")!;

        it("should get the parent when it's the right kind", () => {
            expect(child.getParentIfKindOrThrow(ts.SyntaxKind.ClassDeclaration)).to.not.be.undefined;
        });

        it("should throw when it's not the right kind", () => {
            expect(() => child.getParentIfKindOrThrow(ts.SyntaxKind.InterfaceDeclaration)).to.throw();
        });
    });
});
