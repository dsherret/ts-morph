import {expect} from "chai";
import {SourceFile} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";
import {getFileSystemHostWithFiles} from "./../../testHelpers";
import {TsSimpleAst} from "./../../../TsSimpleAst";

describe(nameof(SourceFile), () => {
    describe(nameof<SourceFile>(n => n.copy), () => {
        const fileText = "    interface Identifier {}    ";
        const {sourceFile, tsSimpleAst} = getInfoFromText(fileText, { filePath: "C:\\Folder\File.ts" });
        const relativeSourceFile = sourceFile.copy("..\\NewFolder\\NewFile.ts");
        const absoluteSourceFile = sourceFile.copy("D:\\NewFile.ts");

        describe(nameof(tsSimpleAst), () => {
            it("should include the copied source files", () => {
                expect(tsSimpleAst.getSourceFiles().length).to.equal(3);
            });
        });

        describe("relative source file", () => {
            it("should have have the same text", () => {
                expect(relativeSourceFile.getFullText()).to.equal(fileText);
            });

            it("should have the expected path", () => {
                expect(relativeSourceFile.getFilePath()).to.equal("C:/NewFolder/NewFile.ts");
            });
        });

        describe("absolute source file", () => {
            it("should have have the same text", () => {
                expect(absoluteSourceFile.getFullText()).to.equal(fileText);
            });

            it("should have the expected path", () => {
                expect(absoluteSourceFile.getFilePath()).to.equal("D:/NewFile.ts");
            });
        });
    });

    describe(nameof<SourceFile>(n => n.save), () => {
        const fileText = "    interface Identifier {}    ";
        const filePath = "C:\\Folder\\File.ts";
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText(fileText, { filePath, host });

        it("should save the file", (done) => {
            sourceFile.save(() => {
                const args = host.getWrittenFileArguments();
                expect(args[0]).to.equal("C:/Folder/File.ts");
                expect(args[1]).to.equal(fileText);
                expect(args.length).to.equal(3); // 3rd is callback
                done();
            });
        });
    });

    describe(nameof<SourceFile>(n => n.saveSync), () => {
        const fileText = "    interface Identifier {}    ";
        const filePath = "C:\\Folder\\File.ts";
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText(fileText, { filePath, host });

        it("should save the file", () => {
            sourceFile.saveSync();
            const args = host.getWrittenFileArguments();
            expect(args[0]).to.equal("C:/Folder/File.ts");
            expect(args[1]).to.equal(fileText);
            expect(args.length).to.equal(2);
        });
    });

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
            const sourceFile = ast.addSourceFileFromText("MyFile.d.ts", "");
            expect(sourceFile.isDeclarationFile()).to.be.true;
        });

        it("should not be a source file when the file name ends with .ts", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromText("MyFile.ts", "");
            expect(sourceFile.isDeclarationFile()).to.be.false;
        });
    });

    describe(nameof<SourceFile>(n => n.getDefaultExportSymbol), () => {
        it("should return undefined when there's no default export", () => {
            const {sourceFile} = getInfoFromText("");
            expect(sourceFile.getDefaultExportSymbol()).to.be.undefined;
        });

        it("should return the default export symbol when one exists", () => {
            const {sourceFile} = getInfoFromText("export default class Identifier {}");
            const defaultExportSymbol = sourceFile.getDefaultExportSymbol()!;
            expect(defaultExportSymbol.getName()).to.equal("default");
        });

        it("should return the default export symbol when default exported on a separate statement", () => {
            const {sourceFile} = getInfoFromText("class Identifier {}\nexport default Identifier;");
            const defaultExportSymbol = sourceFile.getDefaultExportSymbol()!;
            expect(defaultExportSymbol.getName()).to.equal("default");
        });
    });

    describe(nameof<SourceFile>(n => n.removeDefaultExport), () => {
        it("should do nothing when there's no default export", () => {
            const {sourceFile} = getInfoFromText("");
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal("");
        });

        it("should return the default export symbol when one exists", () => {
            const {sourceFile} = getInfoFromText("export default class Identifier {}");
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal("class Identifier {}");
        });

        it("should return the default export symbol when default exported on a separate statement", () => {
            const {sourceFile} = getInfoFromText("namespace Identifier {}\nclass Identifier {}\nexport default Identifier;\n");
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal("namespace Identifier {}\nclass Identifier {}\n");
        });
    });
});
