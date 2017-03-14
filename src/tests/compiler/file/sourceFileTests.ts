import {expect} from "chai";
import {SourceFile} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";
import {TsSimpleAst} from "./../../../TsSimpleAst";

describe(nameof(SourceFile), () => {
    describe(nameof<SourceFile>(n => n.insertText), () => {
        describe("adding a source file child", () => {
            const {sourceFile} = getInfoFromText("    ");
            sourceFile.insertText(2, "  enum MyEnum {}  ");
            it("should update the source file text", () => {
                expect(sourceFile.getFullText()).to.equal("    enum MyEnum {}    ");
            });
        });

        describe("adding a child", () => {
            const {sourceFile} = getInfoFromText("enum MyEnum {}");
            sourceFile.insertText(13, "\n    myNewMember\n");
            it("should update the source file text", () => {
                expect(sourceFile.getFullText()).to.equal("enum MyEnum {\n    myNewMember\n}");
            });
        });
    });

    describe(nameof<SourceFile>(n => n.isSourceFile), () => {
        const {sourceFile, firstChild} = getInfoFromText("enum MyEnum {}");
        it("should return true for the source file", () => {
            expect(sourceFile.isSourceFile()).to.be.true;
        });

        it("should return false for something not a source file", () => {
            expect(firstChild.isSourceFile()).to.be.false;
        });
    });

    describe(nameof<SourceFile>(n => n.isDeclarationFile), () => {
        it("should be a source file when the file name ends with .d.ts", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.createSourceFileFromText("MyFile.d.ts", "");
            expect(sourceFile.isDeclarationFile()).to.be.true;
        });

        it("should not be a source file when the file name ends with .ts", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.createSourceFileFromText("MyFile.ts", "");
            expect(sourceFile.isDeclarationFile()).to.be.false;
        });
    });
});
