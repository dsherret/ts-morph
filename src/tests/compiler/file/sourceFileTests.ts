import { expect } from "chai";
import { Node, EmitResult, ExportAssignment, ExportDeclaration, FileSystemRefreshResult, FormatCodeSettings,
    ImportDeclaration, QuoteKind, SourceFile } from "../../../compiler";
import { Chars } from "../../../constants";
import * as errors from "../../../errors";
import { IndentationText, ManipulationSettings } from "../../../options";
import { Project } from "../../../Project";
import { ExportAssignmentStructure, ExportDeclarationStructure, ImportDeclarationStructure, SourceFileSpecificStructure } from "../../../structures";
import { CompilerOptions, LanguageVariant, ModuleResolutionKind, NewLineKind, ScriptTarget } from "../../../typescript";
import { getFileSystemHostWithFiles } from "../../testHelpers";
import { getInfoFromText } from "../testHelpers";

describe(nameof(SourceFile), () => {
    describe(nameof<SourceFile>(n => n.copy), () => {
        describe("general", () => {
            const fileText = "    interface Identifier {}    ";
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "Folder/File.ts" });
            const relativeSourceFile = sourceFile.copy("../NewFolder/NewFile.ts");
            const absoluteSourceFile = sourceFile.copy("/NewFile.ts");
            const testFile = sourceFile.copy("/TestFile.ts");

            it("should throw if the file already exists", () => {
                expect(() => sourceFile.copy("/TestFile.ts")).to.throw(errors.InvalidOperationError,
                    "Did you mean to provide the overwrite option? A source file already exists at the provided file path: /TestFile.ts");
            });

            it("should overwrite if specifying to overwrite", () => {
                const newText = "const t = 5;";
                sourceFile.replaceWithText(newText);
                const copiedFile = sourceFile.copy("/TestFile.ts", { overwrite: true });
                expect(copiedFile).to.equal(testFile);
                expect(copiedFile.getFullText()).to.equal(newText);
                expect(testFile.getFullText()).to.equal(newText);
            });

            describe(nameof(project), () => {
                it("should include the copied source files", () => {
                    expect(project.getSourceFiles().length).to.equal(4);
                });
            });

            describe("relative source file", () => {
                it("should not be saved", () => {
                    expect(relativeSourceFile.isSaved()).to.be.false;
                });

                it("should have have the same text", () => {
                    expect(relativeSourceFile.getFullText()).to.equal(fileText);
                });

                it("should have the expected path", () => {
                    expect(relativeSourceFile.getFilePath()).to.equal("/NewFolder/NewFile.ts");
                });
            });

            describe("absolute source file", () => {
                it("should not be saved", () => {
                    expect(absoluteSourceFile.isSaved()).to.be.false;
                });

                it("should have have the same text", () => {
                    expect(absoluteSourceFile.getFullText()).to.equal(fileText);
                });

                it("should have the expected path", () => {
                    expect(absoluteSourceFile.getFilePath()).to.equal("/NewFile.ts");
                });
            });
        });

        it("should return the existing source file when copying to the same path", () => {
            const {sourceFile, project} = getInfoFromText("", { filePath: "/Folder/File.ts" });
            const copiedSourceFile = sourceFile.copy(sourceFile.getFilePath());
            expect(copiedSourceFile).to.equal(sourceFile);
        });

        it("should update the imports and exports in the copied source file", () => {
            const originalText = `import {MyInterface} from "./MyInterface";\nexport * from "./MyInterface";`;
            const {sourceFile, project} = getInfoFromText(originalText, { filePath: "/dir/File.ts" });
            const otherFile = project.createSourceFile("/dir/MyInterface.ts", "export interface MyInterface {}");
            const copiedSourceFile = sourceFile.copy("../NewFile");
            expect(sourceFile.getFullText()).to.equal(originalText);
            expect(copiedSourceFile.getFullText()).to.equal(`import {MyInterface} from "./dir/MyInterface";\nexport * from "./dir/MyInterface";`);
        });

        it("should not update the imports and exports if copying to the same directory", () => {
            // module specifiers are this way to check if they change
            const originalText = `import {MyInterface} from "../dir/MyInterface";\nexport * from "../dir/MyInterface";`;
            const {sourceFile, project} = getInfoFromText(originalText, { filePath: "/dir/File.ts" });
            const otherFile = project.createSourceFile("/dir/MyInterface.ts", "export interface MyInterface {}");
            const copiedSourceFile = sourceFile.copy("NewFile");
            expect(sourceFile.getFullText()).to.equal(originalText);
            expect(copiedSourceFile.getFullText()).to.equal(originalText);
        });
    });

    describe(nameof<SourceFile>(n => n.copyImmediately), () => {
        it("should copy the source file and update the file system", async () => {
            const {sourceFile, project} = getInfoFromText("", { filePath: "/File.ts" });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            const newSourceFile = await sourceFile.copyImmediately("NewFile.ts");
            expect(fileSystem.fileExistsSync("/File.ts")).to.be.true;
            expect(fileSystem.fileExistsSync("/NewFile.ts")).to.be.true;
            expect(sourceFile.getFilePath()).to.equal("/File.ts");
            expect(newSourceFile.getFilePath()).to.equal("/NewFile.ts");
        });
    });

    describe(nameof<SourceFile>(n => n.copyImmediatelySync), () => {
        it("should copy the source file and update the file system", () => {
            const {sourceFile, project} = getInfoFromText("", { filePath: "/File.ts" });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            const newSourceFile = sourceFile.copyImmediatelySync("NewFile.ts");
            expect(fileSystem.fileExistsSync("/File.ts")).to.be.true;
            expect(fileSystem.fileExistsSync("/NewFile.ts")).to.be.true;
            expect(sourceFile.getFilePath()).to.equal("/File.ts");
            expect(newSourceFile.getFilePath()).to.equal("/NewFile.ts");
        });
    });

    describe(nameof<SourceFile>(n => n.move), () => {
        function doTest(filePath: string, newFilePath: string, absoluteNewFilePath?: string, overwrite?: boolean) {
            const fileText = "    interface Identifier {}    ";
            const {sourceFile, project} = getInfoFromText(fileText, { filePath });
            const fileSystem = project.getFileSystem();
            const existingFile = project.createSourceFile("/existingFile.ts");
            project.saveSync();
            const interfaceDec = sourceFile.getInterfaceOrThrow("Identifier");
            const newFile = sourceFile.move(newFilePath, { overwrite });
            const isRemovingExisting = overwrite && newFilePath === "/existingFile.ts";
            if (isRemovingExisting)
                expect(existingFile.wasForgotten()).to.be.true;
            expect(newFile).to.equal(sourceFile);
            expect(sourceFile.getFilePath()).to.equal(absoluteNewFilePath || newFilePath);
            expect(sourceFile.getFullText()).to.equal(fileText);
            expect(project.getSourceFile(filePath)).to.be.undefined;
            expect(project.getSourceFile(absoluteNewFilePath || newFilePath)).to.not.be.undefined;
            expect(interfaceDec.wasForgotten()).to.be.false;
            expect(project.getSourceFiles().length).to.equal(isRemovingExisting ? 1 : 2);
            project.saveSync();
            expect(fileSystem.fileExistsSync(absoluteNewFilePath || newFilePath)).to.be.true;
            expect(fileSystem.fileExistsSync(filePath)).to.be.false;
        }

        it("should throw if the file already exists", () => {
            expect(() => doTest("/file.ts", "/existingFile.ts")).to.throw(errors.InvalidOperationError,
                "Did you mean to provide the overwrite option? A source file already exists at the provided file path: /existingFile.ts");
        });

        it("should not throw if the file already exists and the overwrite option was provided", () => {
            doTest("/file.ts", "/existingFile.ts", undefined, true);
        });

        it("should not throw if the file does not exists and the overwrite option was provided", () => {
            doTest("/file.ts", "/newFile.ts", undefined, true);
        });

        it("should move to a relative file path", () => {
            doTest("/dir/file.ts", "../subDir/existingFile.ts", "/subDir/existingFile.ts");
        });

        it("should change the module specifiers in other files when moving", () => {
            const fileText = "export interface MyInterface {}\nexport class MyClass {};";
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface";\nasync function t() { const test = await import('./MyInterface'); }`);
            const file2 = project.createSourceFile("/sub/file2.ts", `import * as interfaces from "../MyInterface";\nimport "./../MyInterface";`);
            const file3 = project.createSourceFile("/sub/file3.ts", `export * from "../MyInterface";\nimport t = require("./../MyInterface");`);
            const file4Text = `export * from "./sub/MyInterface";\nimport "MyOtherFile";`;
            const file4 = project.createSourceFile("/file4.ts", file4Text);
            sourceFile.move("/dir/NewFile.ts");
            expect(file1.getFullText()).to.equal(`import {MyInterface} from "./dir/NewFile";\nasync function t() { const test = await import('./dir/NewFile'); }`);
            expect(file2.getFullText()).to.equal(`import * as interfaces from "../dir/NewFile";\nimport "../dir/NewFile";`);
            expect(file3.getFullText()).to.equal(`export * from "../dir/NewFile";\nimport t = require("../dir/NewFile");`);
            expect(file4.getFullText()).to.equal(file4Text);
        });

        it("should change the module specifiers in other files when moving an index file", () => {
            const fileText = "export interface MyInterface {}";
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/sub/index.ts" });
            const file1 = project.createSourceFile("/file.ts", `import * as test from "./sub";`);
            const file2 = project.createSourceFile("/file2.ts", `import "./sub/index";`);
            sourceFile.move("/dir/index.ts");
            expect(file1.getFullText()).to.equal(`import * as test from "./dir";`);
            expect(file2.getFullText()).to.equal(`import "./dir";`);
        });

        it("should change the module specifiers in the current file when moving", () => {
            const fileText = `import {OtherInterface} from "./OtherInterface";\nexport interface MyInterface {}\nexport * from "./OtherInterface";`;
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const otherFile = project.createSourceFile("/OtherInterface.ts", `import {MyInterface} from "./MyInterface";\nexport interface OtherInterface {}`);
            sourceFile.move("/dir/NewFile.ts");
            expect(sourceFile.getFullText()).to.equal(`import {OtherInterface} from "../OtherInterface";\nexport interface MyInterface {}\nexport * from "../OtherInterface";`);
            expect(otherFile.getFullText()).to.equal(`import {MyInterface} from "./dir/NewFile";\nexport interface OtherInterface {}`);
        });

        it("should handle moving two source files to a new directory (issue #314)", () => {
            // there was a bug previously where the moved source file was removed from the list of dirty source files, but it is dirty because
            // the action of moving (removing and adding) to the cache causes the source file to lose its references
            const fileText = `import {OtherInterface} from "./OtherInterface";\nexport interface MyInterface {}\nexport * from "./OtherInterface";`;
            const otherFileText = `import {MyInterface} from "./MyInterface";\nexport interface OtherInterface {}`;
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const otherFile = project.createSourceFile("/OtherInterface.ts", otherFileText);

            sourceFile.move("/dir/NewFile.ts");
            checkSpecifiers("./dir/NewFile", "../OtherInterface");

            otherFile.move("/dir/OtherInterface.ts");
            checkSpecifiers("./NewFile", "./OtherInterface");

            sourceFile.move("/dir/subDir/NewFile.ts");
            checkSpecifiers("./subDir/NewFile", "../OtherInterface");

            otherFile.move("/dir2/OtherInterface.ts");
            checkSpecifiers("../dir/subDir/NewFile", "../../dir2/OtherInterface");

            function checkSpecifiers(sourceFileSpecifier: string, otherFileSpecifier: string) {
                expect(sourceFile.getFullText()).to.equal(`import {OtherInterface} from "${otherFileSpecifier}";\n` +
                    `export interface MyInterface {}\nexport * from "${otherFileSpecifier}";`);
                expect(otherFile.getFullText()).to.equal(`import {MyInterface} from "${sourceFileSpecifier}";\nexport interface OtherInterface {}`);
            }
        });

        it("should update a module specifier to a source file that was added after the cache was filled", () => {
            const fileText = `import {Identifier} from "./Identifier";`;
            const {sourceFile, project} = getInfoFromText(fileText);

            // do some command that will fill the internal cache
            sourceFile.getReferencingSourceFiles();

            // now add the source file
            const otherFile = project.createSourceFile("/Identifier.ts", "export class Identifier {}");
            sourceFile.move("/dir/File.ts");

            expect(sourceFile.getFullText()).to.equal(`import {Identifier} from "../Identifier";`);
        });

        it("should update a module specifier to a source file that was moved to the location of the module specifier", () => {
            const fileText = `import {Identifier} from "./Identifier";`;
            const {sourceFile, project} = getInfoFromText(fileText);
            const otherFile = project.createSourceFile("/SomeFile.ts", "export class Identifier {}");

            sourceFile.getReferencingSourceFiles(); // fill internal cache
            otherFile.move("/Identifier.ts");
            sourceFile.move("/dir/File.ts");

            expect(sourceFile.getFullText()).to.equal(`import {Identifier} from "../Identifier";`);
        });

        it("should not change the module specifiers in the current file when moving to the same directory", () => {
            // using a weird module specifier to make sure it doesn't update automatically
            const fileText = `import {OtherInterface} from "../dir/OtherInterface";\nexport interface MyInterface {}\nexport * from "../dir/OtherInterface";`;
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/dir/MyInterface.ts" });
            const otherFile = project.createSourceFile("/dir/OtherInterface.ts", `import {MyInterface} from "./MyInterface";\nexport interface OtherInterface {}`);
            sourceFile.move("NewFile.ts");
            expect(sourceFile.getFullText()).to.equal(`import {OtherInterface} from "../dir/OtherInterface";\n` +
                `export interface MyInterface {}\n` +
                `export * from "../dir/OtherInterface";`);
            expect(otherFile.getFullText()).to.equal(`import {MyInterface} from "./NewFile";\nexport interface OtherInterface {}`);
        });
    });

    describe(nameof<SourceFile>(n => n.moveImmediately), () => {
        it("should move the source file and update the file system", async () => {
            const {sourceFile, project} = getInfoFromText("", { filePath: "/File.ts" });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            await sourceFile.moveImmediately("NewFile.ts");
            expect(fileSystem.fileExistsSync("/File.ts")).to.be.false;
            expect(fileSystem.fileExistsSync("/NewFile.ts")).to.be.true;
        });

        it("should only save source file when moving to the same path", async () => {
            const filePath = "/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile, project} = getInfoFromText("", { filePath, host });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            await sourceFile.moveImmediately(filePath);
            expect(fileSystem.fileExistsSync(filePath)).to.be.true;
            expect(host.getDeleteLog().length).to.equal(0);
        });
    });

    describe(nameof<SourceFile>(n => n.moveImmediatelySync), () => {
        it("should move the source file and update the file system", () => {
            const {sourceFile, project} = getInfoFromText("", { filePath: "/File.ts" });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            sourceFile.moveImmediatelySync("NewFile.ts");
            expect(fileSystem.fileExistsSync("/File.ts")).to.be.false;
            expect(fileSystem.fileExistsSync("/NewFile.ts")).to.be.true;
        });

        it("should only save source file when moving to the same path", () => {
            const filePath = "/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile, project} = getInfoFromText("", { filePath, host });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            sourceFile.moveImmediatelySync(filePath);
            expect(fileSystem.fileExistsSync(filePath)).to.be.true;
            expect(host.getDeleteLog().length).to.equal(0);
        });
    });

    describe(nameof<SourceFile>(n => n.save), () => {
        const fileText = "    interface Identifier {}    ";
        const filePath = "/Folder/File.ts";
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText(fileText, { filePath, host });

        it("should save the file", async () => {
            expect(sourceFile.isSaved()).to.be.false;

            await sourceFile.save();
            expect(sourceFile.isSaved()).to.be.true;
            const writeLog = host.getWriteLog();
            const entry = writeLog[0];
            expect(entry.filePath).to.equal(filePath);
            expect(entry.fileText).to.equal(fileText);
            expect(writeLog.length).to.equal(1);
        });
    });

    describe(nameof<SourceFile>(n => n.delete), () => {
        it("should delete the file once save changes is called", async () => {
            const filePath = "/Folder/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile, project} = getInfoFromText("", { filePath, host });
            sourceFile.saveSync();

            sourceFile.delete();
            expect(sourceFile.wasForgotten()).to.be.true;
            expect(host.getDeleteLog().length).to.equal(0);
            project.saveSync();
            const entry = host.getDeleteLog()[0];
            expect(entry.path).to.equal(filePath);
            expect(host.getDeleteLog().length).to.equal(1);
            expect(host.getFiles()).to.deep.equal([]);
        });
    });

    describe(nameof<SourceFile>(n => n.deleteImmediately), () => {
        const filePath = "/Folder/File.ts";
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText("", { filePath, host });
        sourceFile.saveSync();

        it("should delete the file", async () => {
            await sourceFile.deleteImmediately();
            expect(sourceFile.wasForgotten()).to.be.true;
            const deleteLog = host.getDeleteLog();
            const entry = deleteLog[0];
            expect(entry.path).to.equal(filePath);
            expect(deleteLog.length).to.equal(1);
            expect(host.getFiles()).to.deep.equal([]);
        });
    });

    describe(nameof<SourceFile>(n => n.deleteImmediatelySync), () => {
        const filePath = "/Folder/File.ts";
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText("", { filePath, host });
        sourceFile.saveSync();

        it("should delete the file", () => {
            sourceFile.deleteImmediatelySync();
            expect(sourceFile.wasForgotten()).to.be.true;
            const deleteLog = host.getDeleteLog();
            const entry = deleteLog[0];
            expect(entry.path).to.equal(filePath);
            expect(deleteLog.length).to.equal(1);
            expect(host.getFiles()).to.deep.equal([]);
        });
    });

    describe(nameof<SourceFile>(n => n.isSaved), () => {
        const filePath = "/Folder/File.ts";

        it("should not be saved after doing an action that will replace the tree", () => {
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile} = getInfoFromText("class MyClass {}", { filePath, host });
            expect(sourceFile.isSaved()).to.be.false;
            sourceFile.saveSync();
            expect(sourceFile.isSaved()).to.be.true;
            sourceFile.addClass({ name: "NewClass" });
            expect(sourceFile.isSaved()).to.be.false;
        });

        it("should not be saved after doing an action that changes only the text", () => {
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile} = getInfoFromText("class MyClass {}", { filePath, host });
            expect(sourceFile.isSaved()).to.be.false;
            sourceFile.saveSync();
            expect(sourceFile.isSaved()).to.be.true;
            sourceFile.getClasses()[0].rename("NewClassName");
            expect(sourceFile.isSaved()).to.be.false;
        });
    });

    describe(nameof<SourceFile>(n => n.saveSync), () => {
        const fileText = "    interface Identifier {}    ";
        const filePath = "/Folder/File.ts";
        const host = getFileSystemHostWithFiles([]);
        const {sourceFile} = getInfoFromText(fileText, { filePath, host });

        it("should save the file", () => {
            expect(sourceFile.isSaved()).to.be.false;

            sourceFile.saveSync();
            expect(sourceFile.isSaved()).to.be.true;
            const writeLog = host.getWriteLog();
            const entry = writeLog[0];
            expect(entry.filePath).to.equal(filePath);
            expect(entry.fileText).to.equal(fileText);
            expect(writeLog.length).to.equal(1);
        });
    });

    describe(nameof<SourceFile>(n => n.isDeclarationFile), () => {
        it("should be a source file when the file name ends with .d.ts", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("MyFile.d.ts", "");
            expect(sourceFile.isDeclarationFile()).to.be.true;
        });

        it("should not be a source file when the file name ends with .ts", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("MyFile.ts", "");
            expect(sourceFile.isDeclarationFile()).to.be.false;
        });
    });

    describe(nameof<SourceFile>(n => n.isFromExternalLibrary), () => {
        it("should not be when not", () => {
            const { sourceFile } = getInfoFromText("");
            expect(sourceFile.isFromExternalLibrary()).to.be.false;
        });

        it("should be when is", () => {
            const fileSystem = getFileSystemHostWithFiles([
                { filePath: "package.json", text: `{ "name": "testing", "version": "0.0.1" }` },
                {
                    filePath: "node_modules/library/package.json",
                    text: `{ "name": "library", "version": "0.0.1", "main": "index.js", "typings": "index.d.ts", "typescript": { "definition": "index.d.ts" } }`
                },
                { filePath: "node_modules/library/index.js", text: "export class Test {}" },
                { filePath: "node_modules/library/index.d.ts", text: "export class Test {}" }
            ], ["node_modules", "node_modules/library"]);
            const { sourceFile } = getInfoFromText("import { Test } from 'library';", { host: fileSystem });
            const librarySourceFile = sourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFileOrThrow();
            expect(librarySourceFile.isFromExternalLibrary()).to.be.true;
        });
    });

    describe(nameof<SourceFile>(n => n.insertImportDeclarations), () => {
        function doTest(startCode: string, index: number, structures: ImportDeclarationStructure[], expectedCode: string, useSingleQuotes = false) {
            const {sourceFile, project} = getInfoFromText(startCode);
            if (useSingleQuotes)
                project.manipulationSettings.set({ quoteKind: QuoteKind.Single });
            const result = sourceFile.insertImportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of imports", () => {
            doTest("", 0, [
                { moduleSpecifier: "./test" },
                { defaultImport: "identifier", moduleSpecifier: "./test" },
                { defaultImport: "identifier", namespaceImport: "name", moduleSpecifier: "./test" },
                { defaultImport: "identifier", namedImports: ["name1", { name: "name" }, { name: "name", alias: "alias" }], moduleSpecifier: "./test" },
                { namedImports: ["name"], moduleSpecifier: "./test" },
                { namespaceImport: "name", moduleSpecifier: "./test" }
            ], [
                `import "./test";`,
                `import identifier from "./test";`,
                `import identifier, * as name from "./test";`,
                `import identifier, { name1, name, name as alias } from "./test";`,
                `import { name } from "./test";`,
                `import * as name from "./test";`
            ].join("\n") + "\n");
        });

        it("should throw when specifying a namespace import and named imports", () => {
            const {sourceFile} = getInfoFromText("");

            expect(() => {
                sourceFile.insertImportDeclarations(0, [{ namespaceImport: "name", namedImports: ["name"], moduleSpecifier: "file" }]);
            }).to.throw();
        });

        it("should insert an import after a utf-8 bom", () => {
            doTest(Chars.BOM, 0, [{ moduleSpecifier: "./test" }], `${Chars.BOM}import "./test";\n`);
        });

        it("should insert at the beginning and use single quotes when specified", () => {
            doTest(`export class Class {}\n`, 0, [{ moduleSpecifier: "./test" }], `import './test';\n\nexport class Class {}\n`, true);
        });

        it("should insert in the middle", () => {
            doTest(`import "./file1";\nimport "./file3";\n`, 1, [{ moduleSpecifier: "./file2" }], `import "./file1";\nimport "./file2";\nimport "./file3";\n`);
        });

        it("should insert at the end", () => {
            doTest(`export class Class {}\n`, 1, [{ moduleSpecifier: "./test" }], `export class Class {}\n\nimport "./test";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.insertImportDeclaration), () => {
        function doTest(startCode: string, index: number, structure: ImportDeclarationStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertImportDeclaration(index, structure);
            expect(result).to.be.instanceOf(ImportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`import "./file1";\nimport "./file3";\n`, 1, { moduleSpecifier: "./file2" }, `import "./file1";\nimport "./file2";\nimport "./file3";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addImportDeclaration), () => {
        function doTest(startCode: string, structure: ImportDeclarationStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addImportDeclaration(structure);
            expect(result).to.be.instanceOf(ImportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add at the last import if one exists", () => {
            doTest(`import "./file1";\nimport "./file2";\n\nexport class MyClass {}\n`, { moduleSpecifier: "./file3" },
                `import "./file1";\nimport "./file2";\nimport "./file3";\n\nexport class MyClass {}\n`);
        });

        it("should add at the start if no imports exists", () => {
            doTest(`export class MyClass {}\n`, { moduleSpecifier: "./file" },
                `import "./file";\n\nexport class MyClass {}\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addImportDeclarations), () => {
        function doTest(startCode: string, structures: ImportDeclarationStructure[], expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addImportDeclarations(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add at the last import if one exists", () => {
            doTest(`import "./file1";\n\nexport class MyClass {}\n`, [{ moduleSpecifier: "./file2" }, { moduleSpecifier: "./file3" }],
                `import "./file1";\nimport "./file2";\nimport "./file3";\n\nexport class MyClass {}\n`);
        });

        it("should add at the start if no imports exists", () => {
            doTest(`export class MyClass {}\n`, [{ moduleSpecifier: "./file1" }, { moduleSpecifier: "./file2" }],
                `import "./file1";\nimport "./file2";\n\nexport class MyClass {}\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.getImportDeclarations), () => {
        it("should get the import declarations", () => {
            const {sourceFile} = getInfoFromText("import myImport from 'test'; import {next} from './test';");
            expect(sourceFile.getImportDeclarations().length).to.equal(2);
            expect(sourceFile.getImportDeclarations()[0]).to.be.instanceOf(ImportDeclaration);
        });
    });

    describe(nameof<SourceFile>(n => n.getImportDeclaration), () => {
        it("should get the import declaration", () => {
            const {sourceFile} = getInfoFromText("import myImport from 'test'; import {next} from './test';");
            expect(sourceFile.getImportDeclaration(i => i.getDefaultImport() != null)!.getText()).to.equal("import myImport from 'test';");
        });

        it("should return undefined when not exists", () => {
            const {sourceFile} = getInfoFromText("");
            expect(sourceFile.getImportDeclaration(e => false)).to.be.undefined;
        });
    });

    describe(nameof<SourceFile>(n => n.getImportDeclarationOrThrow), () => {
        it("should get the import declaration", () => {
            const {sourceFile} = getInfoFromText("import myImport from 'test'; import {next} from './test';");
            expect(sourceFile.getImportDeclarationOrThrow(i => i.getDefaultImport() != null).getText()).to.equal("import myImport from 'test';");
        });

        it("should throw when not exists", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.getImportDeclarationOrThrow(e => false)).to.throw();
        });
    });

    describe(nameof<SourceFile>(n => n.insertExportDeclarations), () => {
        function doTest(startCode: string, index: number, structures: ExportDeclarationStructure[], expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertExportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of exports", () => {
            doTest("", 0, [
                { moduleSpecifier: "./test" },
                { namedExports: ["name1", { name: "name" }, { name: "name", alias: "alias" }], moduleSpecifier: "./test" },
                { namedExports: ["name"] },
                { }
            ], [
                `export * from "./test";`,
                `export { name1, name, name as alias } from "./test";`,
                `export { name };`,
                `export { };`
            ].join("\n") + "\n");
        });

        it("should insert at the beginning", () => {
            doTest(`export class Class {}\n`, 0, [{ moduleSpecifier: "./test" }], `export * from "./test";\n\nexport class Class {}\n`);
        });

        it("should insert in the middle", () => {
            doTest(`export * from "./file1";\nexport * from "./file3";\n`, 1, [{ moduleSpecifier: "./file2" }],
                `export * from "./file1";\nexport * from "./file2";\nexport * from "./file3";\n`);
        });

        it("should insert at the end", () => {
            doTest(`export class Class {}\n`, 1, [{ moduleSpecifier: "./test" }], `export class Class {}\n\nexport * from "./test";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.insertExportDeclaration), () => {
        function doTest(startCode: string, index: number, structure: ExportDeclarationStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertExportDeclaration(index, structure);
            expect(result).to.be.instanceOf(ExportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`export * from "./file1";\nexport * from "./file3";\n`, 1, { moduleSpecifier: "./file2" },
                `export * from "./file1";\nexport * from "./file2";\nexport * from "./file3";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addExportDeclaration), () => {
        function doTest(startCode: string, structure: ExportDeclarationStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addExportDeclaration(structure);
            expect(result).to.be.instanceOf(ExportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should always add at the end of the file", () => {
            doTest(`export class MyClass {}\n`, { moduleSpecifier: "./file" },
                `export class MyClass {}\n\nexport * from "./file";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addExportDeclarations), () => {
        function doTest(startCode: string, structures: ExportDeclarationStructure[], expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addExportDeclarations(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add multiple", () => {
            doTest(`export class MyClass {}\n`, [{ moduleSpecifier: "./file1" }, { moduleSpecifier: "./file2" }],
                `export class MyClass {}\n\nexport * from "./file1";\nexport * from "./file2";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.getExportDeclarations), () => {
        it("should get the export declarations", () => {
            const {sourceFile} = getInfoFromText("export * from 'test'; export {next} from './test';");
            expect(sourceFile.getExportDeclarations().length).to.equal(2);
            expect(sourceFile.getExportDeclarations()[0]).to.be.instanceOf(ExportDeclaration);
        });
    });

    describe(nameof<SourceFile>(n => n.getExportDeclaration), () => {
        it("should get the export declaration", () => {
            const {sourceFile} = getInfoFromText("export * from 'test'; export {next} from './test';");
            expect(sourceFile.getExportDeclaration(e => e.isNamespaceExport())!.getText()).to.equal("export * from 'test';");
        });
    });

    describe(nameof<SourceFile>(n => n.getExportDeclarationOrThrow), () => {
        it("should get the export declaration", () => {
            const {sourceFile} = getInfoFromText("export * from 'test'; export {next} from './test';");
            expect(sourceFile.getExportDeclarationOrThrow(e => e.isNamespaceExport()).getText()).to.equal("export * from 'test';");
        });

        it("should throw when not exists", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.getExportDeclarationOrThrow(e => false)).to.throw();
        });
    });

    describe(nameof<SourceFile>(n => n.getExportedDeclarations), () => {
        it("should get the exported declarations", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";\nexport {OtherClass} from "./otherClass";\nexport * from "./barrel";\n` +
                "export class MainFileClass {}\nexport default MainFileClass;");
            project.createSourceFile("class.ts", `export class Class {} export class MyClass {}`);
            project.createSourceFile("otherClass.ts", `export class OtherClass {}\nexport class InnerClass {}`);
            project.createSourceFile("barrel.ts", `export * from "./subBarrel";`);
            project.createSourceFile("subBarrel.ts", `export * from "./subFile";\nexport {SubClass2 as Test} from "./subFile2";\n` +
                `export {default as SubClass3} from "./subFile3"`);
            project.createSourceFile("subFile.ts", `export class SubClass {}`);
            project.createSourceFile("subFile2.ts", `export class SubClass2 {}`);
            project.createSourceFile("subFile3.ts", `class SubClass3 {}\nexport default SubClass3;`);

            expect(mainSourceFile.getExportedDeclarations().map(d => (d as any).getName()).sort())
                .to.deep.equal(["MainFileClass", "OtherClass", "Class", "MyClass", "SubClass", "SubClass2", "SubClass3"].sort());
        });

        it("should get the exported declaration when there's only a default export using an export assignment", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", "class MainFileClass {}\nexport default MainFileClass;");

            expect(mainSourceFile.getExportedDeclarations().map(d => (d as any).getName()).sort())
                .to.deep.equal(["MainFileClass"].sort());
        });
    });

    describe(nameof<SourceFile>(n => n.insertExportAssignments), () => {
        function doTest(startCode: string, index: number, structures: ExportAssignmentStructure[], expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertExportAssignments(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of exports", () => {
            doTest("", 0, [
                { expression: "5" },
                { isExportEquals: true, expression: writer => writer.write("6") },
                { isExportEquals: false, expression: "name" }
            ], [
                `export = 5;`,
                `export = 6;`,
                `export default name;`
            ].join("\n") + "\n");
        });

        it("should insert at the beginning", () => {
            doTest(`export class Class {}\n`, 0, [{ expression: "5" }], `export = 5;\n\nexport class Class {}\n`);
        });

        it("should insert in the middle", () => {
            doTest(`export * from "./file1";\nexport = 6;\n`, 1, [{ expression: "5" }],
                `export * from "./file1";\n\nexport = 5;\nexport = 6;\n`);
        });

        it("should insert at the end", () => {
            doTest(`export class Class {}\n`, 1, [{ expression: "5" }], `export class Class {}\n\nexport = 5;\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.insertExportAssignment), () => {
        function doTest(startCode: string, index: number, structure: ExportAssignmentStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.insertExportAssignment(index, structure);
            expect(result).to.be.instanceOf(ExportAssignment);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`export * from "./file1";\nexport = 6;\n`, 1, { expression: "5" },
                `export * from "./file1";\n\nexport = 5;\nexport = 6;\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addExportAssignment), () => {
        function doTest(startCode: string, structure: ExportAssignmentStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addExportAssignment(structure);
            expect(result).to.be.instanceOf(ExportAssignment);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should always add at the end of the file", () => {
            doTest(`export class MyClass {}\n`, { expression: "5" },
                `export class MyClass {}\n\nexport = 5;\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.addExportAssignments), () => {
        function doTest(startCode: string, structures: ExportAssignmentStructure[], expectedCode: string) {
            const {sourceFile} = getInfoFromText(startCode);
            const result = sourceFile.addExportAssignments(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add multiple", () => {
            doTest(`export class MyClass {}\n`, [{ expression: "5" }, { expression: "6" }],
                `export class MyClass {}\n\nexport = 5;\nexport = 6;\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.getExportAssignments), () => {
        it("should get the export declarations", () => {
            const {sourceFile} = getInfoFromText("export = 5; export = 6;");
            expect(sourceFile.getExportAssignments().length).to.equal(2);
            expect(sourceFile.getExportAssignments()[0]).to.be.instanceOf(ExportAssignment);
        });
    });

    describe(nameof<SourceFile>(n => n.getExportAssignment), () => {
        it("should get the export declaration", () => {
            const {sourceFile} = getInfoFromText("export = 5; export default 6;");
            expect(sourceFile.getExportAssignment(e => !e.isExportEquals())!.getText()).to.equal("export default 6;");
        });
    });

    describe(nameof<SourceFile>(n => n.getExportAssignmentOrThrow), () => {
        it("should get the export declaration", () => {
            const {sourceFile} = getInfoFromText("export = 5; export default 6;");
            expect(sourceFile.getExportAssignmentOrThrow(e => !e.isExportEquals()).getText()).to.equal("export default 6;");
        });

        it("should throw when not exists", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.getExportAssignmentOrThrow(e => false)).to.throw();
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

    describe(nameof<SourceFile>(n => n.getDefaultExportSymbolOrThrow), () => {
        it("should throw when there's no default export", () => {
            const {sourceFile} = getInfoFromText("");
            expect(() => sourceFile.getDefaultExportSymbolOrThrow()).to.throw();
        });

        it("should return the default export symbol when one exists", () => {
            const {sourceFile} = getInfoFromText("export default class Identifier {}");
            expect(sourceFile.getDefaultExportSymbolOrThrow().getName()).to.equal("default");
        });
    });

    describe(nameof<SourceFile>(n => n.removeDefaultExport), () => {
        it("should do nothing when there's no default export", () => {
            const {sourceFile} = getInfoFromText("");
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal("");
        });

        it("should remove the default export symbol when one exists", () => {
            const {sourceFile} = getInfoFromText("export default class Identifier {}");
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal("class Identifier {}");
        });

        it("should remove the default export symbol when default exported on a separate statement", () => {
            const {sourceFile} = getInfoFromText("namespace Identifier {}\nclass Identifier {}\nexport default Identifier;\n");
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal("namespace Identifier {}\nclass Identifier {}\n");
        });
    });

    describe(nameof<SourceFile>(n => n.getLanguageVariant), () => {
        it("should return standard when in a ts file", () => {
            const {sourceFile} = getInfoFromText("");
            expect(sourceFile.getLanguageVariant()).to.equal(LanguageVariant.Standard);
        });

        it("should return jsx when in a tsx file", () => {
            const {sourceFile} = getInfoFromText("", { filePath: "file.tsx" });
            expect(sourceFile.getLanguageVariant()).to.equal(LanguageVariant.JSX);
        });
    });

    describe(nameof<SourceFile>(n => n.emit), () => {
        it("should emit the source file", () => {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions: { noLib: true, outDir: "dist" } }, fileSystem);
            const sourceFile = project.createSourceFile("file1.ts", "const num1 = 1;");
            project.createSourceFile("file2.ts", "const num2 = 2;");
            const result = sourceFile.emit();

            expect(result).to.be.instanceof(EmitResult);
            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog.length).to.equal(1);
        });
    });

    describe(nameof<SourceFile>(n => n.getEmitOutput), () => {
        it("should get the emit output for the source file", () => {
            const project = new Project({ compilerOptions: { noLib: true, outDir: "dist", target: ScriptTarget.ES5 }, useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("file1.ts", "const num1 = 1;");
            const result = sourceFile.getEmitOutput();

            expect(result.getEmitSkipped()).to.be.false;
            expect(result.getOutputFiles().length).to.equal(1);
            const outputFile = result.getOutputFiles()[0];
            expect(outputFile.getText()).to.equal("var num1 = 1;\n");
            expect(outputFile.getFilePath()).to.equal("/dist/file1.js");
        });

        it("should only emit the declaration file when specified", () => {
            const project = new Project({ compilerOptions: { noLib: true, declaration: true, outDir: "dist", target: ScriptTarget.ES5 }, useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("file1.ts", "const num1 = 1;");
            const result = sourceFile.getEmitOutput({ emitOnlyDtsFiles: true });

            expect(result.getEmitSkipped()).to.be.false;
            expect(result.getOutputFiles().length).to.equal(1);
            const outputFile = result.getOutputFiles()[0];
            expect(outputFile.getFilePath()).to.equal("/dist/file1.d.ts");
        });
    });

    describe(nameof<SourceFile>(n => n.fill), () => {
        function doTest(startingCode: string, structure: SourceFileSpecificStructure, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startingCode);
            sourceFile.fill(structure);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            doTest("", {}, "");
        });

        it("should modify when changed", () => {
            const structure: MakeRequired<SourceFileSpecificStructure> = {
                imports: [{ moduleSpecifier: "module" }],
                exports: [{ moduleSpecifier: "export-module" }]
            };
            doTest("", structure, `import "module";\n\nexport * from "export-module";\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.formatText), () => {
        function doTest(startingCode: string, expectedCode: string, manipulationSettings: Partial<ManipulationSettings> = {}, settings: FormatCodeSettings = {}) {
            const {project, sourceFile} = getInfoFromText(startingCode);
            project.manipulationSettings.set(manipulationSettings);
            sourceFile.formatText(settings);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should format the text when it contains different spacing", () => {
            doTest("class     MyClass{}", "class MyClass { }\n");
        });

        it("should not add a newline when specifying not to ensure", () => {
            doTest("class MyClass{ }", "class MyClass { }", {}, { ensureNewLineAtEndOfFile: false });
        });

        it("should by default add spaces immediately within named import braces", () => {
            doTest("import {name, name2} from 'test';", "import { name, name2 } from 'test';\n");
        });

        it("should format the text with eight spaces", () => {
            doTest("class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\n        myMethod() {\n        }\n}\n",
                { indentationText: IndentationText.EightSpaces });
        });

        it("should format the text with four spaces", () => {
            doTest("class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\n    myMethod() {\n    }\n}\n",
                { indentationText: IndentationText.FourSpaces });
        });

        it("should format the text with two spaces", () => {
            doTest("class MyClass {\n    myMethod() {\n        console.log(t);\n    }\n}",
                "class MyClass {\n  myMethod() {\n    console.log(t);\n  }\n}\n",
                { indentationText: IndentationText.TwoSpaces });
        });

        it("should format the text with tabs", () => {
            doTest("class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\n\tmyMethod() {\n\t}\n}\n",
                { indentationText: IndentationText.Tab });
        });

        it("should format the text to spaces when using tabs", () => {
            doTest("class MyClass {\n\tmyMethod() {\n\t}\n}",
                "class MyClass {\n  myMethod() {\n  }\n}\n",
                { indentationText: IndentationText.TwoSpaces });
        });

        it("should format the text with slash r slash n newlines", () => {
            doTest("class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\r\n\tmyMethod() {\r\n\t}\r\n}\r\n",
                { indentationText: IndentationText.Tab, newLineKind: NewLineKind.CarriageReturnLineFeed });
        });

        it("should format the text with slash n newlines", () => {
            doTest("class MyClass {\r\n    myMethod() {\r\n    }\r\n}",
                "class MyClass {\n\tmyMethod() {\n\t}\n}\n",
                { indentationText: IndentationText.Tab, newLineKind: NewLineKind.LineFeed });
        });

        it("should format and not indent within strings", () => {
            doTest("class MyClass {\n    myMethod() {\n        const t = `\nt`;\n    }\n}",
                "class MyClass {\n  myMethod() {\n    const t = `\nt`;\n  }\n}\n",
                { indentationText: IndentationText.TwoSpaces });
        });

        it("should format and not format within strings", () => {
            doTest("class MyClass {\n    myMethod() {\n        const t = `\n    t`;\n    }\n}",
                "class MyClass {\n\tmyMethod() {\n\t\tconst t = `\n    t`;\n\t}\n}\n",
                { indentationText: IndentationText.Tab });
        });

        it("should format the text when it contains multiple semi colons", () => {
            doTest("var myTest: string;;;;", "var myTest: string;;;;\n");
        });

        it("should format the text when it contains syntax errors", () => {
            doTest("function myTest(}{{{{}}) {}", "function myTest(}{{{{ }}) { }\n");
        });

        it("should format the text in the documentation as described", () => {
            doTest(`var myVariable     :      string |    number;
function myFunction(param    : MyClass){
return "";
}
`, `var myVariable: string | number;
function myFunction(param: MyClass) {
    return "";
}
`);
        });
    });

    describe(nameof<SourceFile>(n => n.indent), () => {
        function doTest(startingCode: string, rangeOrPos: [number, number] | number, times: number, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startingCode);
            sourceFile.indent(rangeOrPos, times);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should throw when the range is outside the lower bound of the file", () => {
            const {sourceFile} = getInfoFromText(" ");
            expect(() => sourceFile.indent([-1, 0])).to.throw();
        });

        it("should throw when the range is outside the upper bound of the file", () => {
            const {sourceFile} = getInfoFromText(" ");
            expect(() => sourceFile.indent([0, 2])).to.throw();
        });

        it("should throw when the range is flipped", () => {
            const {sourceFile} = getInfoFromText("     ");
            expect(() => sourceFile.indent([2, 1])).to.throw();
        });

        it("should indent the specified pos", () => {
            doTest("//testing\n//testing\n//testing", 11, 1, "//testing\n    //testing\n//testing");
        });

        it("should do nothing when specifying a times of 0", () => {
            doTest("//testing\n//testing\n//testing", 11, 0, "//testing\n//testing\n//testing");
        });

        it("should indent the specified text based on the lines provided", () => {
            const sourceFileLines = ["class MyClass {", "    test;", "}"];
            doTest(sourceFileLines.join("\n"), [sourceFileLines[0].length + 1, sourceFileLines[0].length + 1 + sourceFileLines[1].length], 3,
                `class MyClass {
                test;
}`);
        });

        it("should indent the line when specifying the end of it for the start of the range", () => {
            const sourceFileLines = ["class MyClass {", "    test;", "}"];
            doTest(sourceFileLines.join("\n"), [sourceFileLines[0].length, sourceFileLines[0].length + 1], 1,
                `    class MyClass {
        test;
}`);
        });

        it("should not indent within a multiline string", () => {
            doTest(`"somestring \\\notherstring";`, 17, 1, `"somestring \\\notherstring";`);
        });

        it("should not indent within a template string", () => {
            doTest(`\`testingthiso\ntestingmore$\{here}testing\`;`, 17, 1, `\`testingthiso\ntestingmore$\{here}testing\`;`);
        });

        it("should indent when string starts on line", () => {
            doTest(`"somestring";`, 0, 1, `    "somestring";`);
        });

        it("should indent when only specifying two spaces", () => {
            const {sourceFile} = getInfoFromText("//code");
            sourceFile.context.manipulationSettings.set({ indentationText: IndentationText.TwoSpaces });
            sourceFile.indent(0);
            expect(sourceFile.getFullText()).to.equal("  //code");
        });

        it("should indent when specifying tabs", () => {
            const {sourceFile} = getInfoFromText("//code");
            sourceFile.context.manipulationSettings.set({ indentationText: IndentationText.Tab });
            sourceFile.indent(0);
            expect(sourceFile.getFullText()).to.equal("\t//code");
        });
    });

    describe(nameof<SourceFile>(n => n.unindent), () => {
        // most of the tests are in indent
        function doTest(startingCode: string, rangeOrPos: [number, number] | number, times: number, expectedCode: string) {
            const {sourceFile} = getInfoFromText(startingCode);
            sourceFile.unindent(rangeOrPos, times);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should do nothing when already unindented to the end of the line", () => {
            doTest("//testing\n//testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
        });

        it("should unindent when indented", () => {
            doTest("//testing\n    //testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
        });

        it("should unindent when the line doesn't have the unindent number of spaces", () => {
            doTest("//testing\n //testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
            doTest("//testing\n  //testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
            doTest("//testing\n   //testing\n//testing", 11, 1, "//testing\n//testing\n//testing");
        });

        it("should unindent when using tabs", () => {
            doTest("//testing\n\t\t\t//testing\n//testing", 11, 1, "//testing\n\t\t//testing\n//testing");
        });

        it("should unindent when mixing tabs and spaces", () => {
            doTest("//testing\n\t\t    //testing\n//testing", 11, 3, "//testing\n//testing\n//testing");
        });

        it("should unindent multiple times", () => {
            doTest("//testing\n\t\t\t//testing\n//testing", 11, 2, "//testing\n\t//testing\n//testing");
        });
    });

    describe(nameof<SourceFile>(s => s.refreshFromFileSystemSync), () => {
        it("should update the text", () => {
            const filePath = "/File.ts";
            const newText = "let t: string;";
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile, firstChild} = getInfoFromText("class MyClass {}", { filePath, host });
            sourceFile.saveSync();
            expect(sourceFile.refreshFromFileSystemSync()).to.equal(FileSystemRefreshResult.NoChange);
            host.writeFileSync(filePath, newText);
            expect(sourceFile.refreshFromFileSystemSync()).to.equal(FileSystemRefreshResult.Updated);
            expect(firstChild.wasForgotten()).to.be.true;
            expect(sourceFile.isSaved()).to.be.true;
            expect(sourceFile.getFullText()).to.equal(newText);
            host.deleteSync(filePath);
            expect(sourceFile.refreshFromFileSystemSync()).to.equal(FileSystemRefreshResult.Deleted);
            expect(sourceFile.wasForgotten()).to.be.true;
        });

        it("should throw when the read file throws an error other than file not found", () => {
            const filePath = "/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile} = getInfoFromText("class MyClass {}", { filePath, host });
            sourceFile.saveSync();
            const error = new Error("");
            host.readFileSync = path => {
                throw error;
            };
            expect(() => sourceFile.refreshFromFileSystemSync()).to.throw(error);
        });
    });

    describe(nameof<SourceFile>(s => s.refreshFromFileSystem), () => {
        it("should update the text", async () => {
            const filePath = "/File.ts";
            const newText = "let t: string;";
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile, firstChild} = getInfoFromText("class MyClass {}", { filePath, host });
            await sourceFile.save();
            expect(await sourceFile.refreshFromFileSystem()).to.equal(FileSystemRefreshResult.NoChange);
            await host.writeFile(filePath, newText);
            expect(await sourceFile.refreshFromFileSystem()).to.equal(FileSystemRefreshResult.Updated);
            expect(firstChild.wasForgotten()).to.be.true;
            expect(sourceFile.isSaved()).to.be.true;
            expect(sourceFile.getFullText()).to.equal(newText);
            await host.delete(filePath);
            expect(await sourceFile.refreshFromFileSystem()).to.equal(FileSystemRefreshResult.Deleted);
            expect(sourceFile.wasForgotten()).to.be.true;
        });

        it("should throw when the read file throws an error other than file not found", async () => {
            const filePath = "/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const {sourceFile} = getInfoFromText("class MyClass {}", { filePath, host });
            await sourceFile.save();
            const error = new Error("");
            host.readFile = path => Promise.reject(error);

            // testing a promise rejection without an UnhandledPromiseRejectionWarning
            let didThrow = false;
            try {
                await sourceFile.refreshFromFileSystem();
            } catch (err) {
                didThrow = err === error;
            }

            expect(didThrow).to.be.true;
        });
    });

    describe(nameof<SourceFile>(s => s.getRelativePathTo), () => {
        function doSourceFileTest(from: string, to: string, expected: string) {
            const project = new Project({ useVirtualFileSystem: true });
            const fromFile = project.createSourceFile(from);
            const toFile = project.createSourceFile(to);
            expect(fromFile.getRelativePathTo(toFile)).to.equal(expected);
        }

        // most of these tests are in fileUtilsTests

        it("should get the relative path to a source file in a different directory", () => {
            doSourceFileTest("/dir/from.ts", "/dir2/to.ts", "../dir2/to.ts");
        });

        function doDirTest(from: string, to: string, expected: string) {
            const project = new Project({ useVirtualFileSystem: true });
            const fromFile = project.createSourceFile(from);
            const toDir = project.createDirectory(to);
            expect(fromFile.getRelativePathTo(toDir)).to.equal(expected);
        }

        it("should get the relative path to a directory", () => {
            doSourceFileTest("/dir/from.ts", "/dir2/dir3", "../dir2/dir3");
        });
    });

    describe(nameof<SourceFile>(s => s.getRelativePathAsModuleSpecifierTo), () => {
        function doSourceFileTest(from: string, to: string, expected: string, compilerOptions?: CompilerOptions) {
            const project = new Project({ useVirtualFileSystem: true, compilerOptions });
            const fromFile = project.createSourceFile(from);
            const toFile = from === to ? fromFile : project.createSourceFile(to);
            expect(fromFile.getRelativePathAsModuleSpecifierTo(toFile)).to.equal(expected);
        }

        it("should get the module specifier to a source file in a different directory", () => {
            doSourceFileTest("/dir/from.ts", "/dir2/to.ts", "../dir2/to");
        });

        it("should get the module specifier to a source file in the same directory", () => {
            doSourceFileTest("/dir/from.ts", "/dir/to.ts", "./to");
        });

        it("should get the module specifier to the same source file", () => {
            doSourceFileTest("/dir/file.ts", "/dir/file.ts", "./file");
        });

        it("should get the module specifier to a definition file", () => {
            doSourceFileTest("/dir/from.ts", "/dir2/to.d.ts", "../dir2/to");
        });

        it("should get the module specifier to a definition file that doing use a lower case extension", () => {
            doSourceFileTest("/dir/from.ts", "/dir2/to.D.TS", "../dir2/to");
        });

        it("should use an implicit index when specifying the index file in a different directory", () => {
            doSourceFileTest("/dir/file.ts", "/dir2/index.ts", "../dir2");
        });

        it("should use an implicit index when specifying the index file in a parent directory", () => {
            doSourceFileTest("/dir/parent/file.ts", "/dir/index.ts", "../../dir");
        });

        it("should use an implicit index when specifying the index file in a different directory that has different casing", () => {
            doSourceFileTest("/dir/file.ts", "/dir2/INDEX.ts", "../dir2");
        });

        it("should use an implicit index when specifying the index file of a definition file in a different directory", () => {
            doSourceFileTest("/dir/file.ts", "/dir2/index.d.ts", "../dir2");
        });

        it("should use an explicit index when the module resolution strategy is classic", () => {
            doSourceFileTest("/dir/file.ts", "/dir2/index.d.ts", "../dir2/index", { moduleResolution: ModuleResolutionKind.Classic });
        });

        it("should use an explicit index when something else in the compiler options means the module resolution will be classic", () => {
            doSourceFileTest("/dir/file.ts", "/dir2/index.d.ts", "../dir2/index", { target: ScriptTarget.ES2015 });
        });

        it("should use an implicit index when specifying the index file in the same directory", () => {
            doSourceFileTest("/dir/file.ts", "/dir/index.ts", "./index");
        });

        it("should use an implicit index when specifying the index file in the root directory", () => {
            doSourceFileTest("/file.ts", "/index.ts", "./index");
        });

        function doDirectoryTest(from: string, to: string, expected: string, compilerOptions?: CompilerOptions) {
            const project = new Project({ useVirtualFileSystem: true, compilerOptions });
            const fromFile = project.createSourceFile(from);
            const toDirectory = project.createDirectory(to);
            expect(fromFile.getRelativePathAsModuleSpecifierTo(toDirectory)).to.equal(expected);
        }

        it("should get the path to a directory as a module specifier", () => {
            doDirectoryTest("/dir/file.ts", "/dir/dir2", "./dir2");
        });

        it("should use an explicit index when getting the module specifier to a directory and the module resolution strategy is classic", () => {
            doDirectoryTest("/dir/file.ts", "/dir2", "../dir2/index", { moduleResolution: ModuleResolutionKind.Classic });
        });
    });

    describe(nameof<SourceFile>(s => s.getReferencingNodesInOtherSourceFiles), () => {
        it("should get the imports, exports, import equals, and dynamic imports that reference this source file", () => {
            const fileText = "export interface MyInterface {}\nexport class MyClass {}";
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface";`);
            const file2 = project.createSourceFile("/sub/file2.ts", `import * as interfaces from "../MyInterface";\nimport "./../MyInterface";`);
            const file3 = project.createSourceFile("/sub/file3.ts", `export * from "../MyInterface";\n` +
                `import test = require("../MyInterface");\n` +
                `async function t() { const u = await import("../MyInterface"); }`);
            const file4 = project.createSourceFile("/file4.ts", `export * from "./sub/MyInterface";\nimport "MyOtherFile";`);

            const referencing = sourceFile.getReferencingNodesInOtherSourceFiles();
            expect(referencing.map(r => r.getText()).sort()).to.deep.equal([...[...file1.getImportDeclarations(),
                ...file2.getImportDeclarations(), ...file3.getExportDeclarations()].map(d => d.getText()),
                `import test = require("../MyInterface");`, `import("../MyInterface")`].sort());
        });

        it("should get the nodes that reference an index file", () => {
            const fileText = "export interface MyInterface {}";
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/sub/index.ts" });
            const file1 = project.createSourceFile("/file.ts", `export * from "./sub";`);
            const file2 = project.createSourceFile("/file2.ts", `import "./sub/index";`);
            const referencing = sourceFile.getReferencingNodesInOtherSourceFiles();
            expect(referencing.map(r => r.getText()).sort()).to.deep.equal([...file1.getExportDeclarations(),
                ...file2.getImportDeclarations()].map(d => d.getText()).sort());
        });

        it("should keep the references up to date during manipulations", () => {
            const {sourceFile, project} = getInfoFromText("export class MyClass {}", { filePath: "/MyClass.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyClass} from "./MyClass";`);
            expect(sourceFile.getReferencingNodesInOtherSourceFiles().map(r => r.getText())).to.deep.equal([`import {MyClass} from "./MyClass";`]);
            file1.getImportDeclarations()[0].remove();
            expect(sourceFile.getReferencingNodesInOtherSourceFiles().map(r => r.getText())).to.deep.equal([]);
            file1.addExportDeclaration({ moduleSpecifier: "./MyClass" });
            expect(sourceFile.getReferencingNodesInOtherSourceFiles().map(r => r.getText())).to.deep.equal([`export * from "./MyClass";`]);
            file1.delete();
            expect(sourceFile.getReferencingNodesInOtherSourceFiles().map(r => r.getText())).to.deep.equal([]);
        });
    });

    describe(nameof<SourceFile>(s => s.getReferencingLiteralsInOtherSourceFiles), () => {
        // the tests in getReferencingNodesInOtherSourceFiles cover most of the testing here

        it("should get the imports, exports, import equals, and dynamic imports that reference this source file", () => {
            const fileText = "export interface MyInterface {}\nexport class MyClass {}";
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface";`);
            const file2 = project.createSourceFile("/sub/file2.ts", `import * as interfaces from "../MyInterface";\nimport "./../MyInterface";`);
            const file3 = project.createSourceFile("/sub/file3.ts", `export * from "../MyInterface";\n` +
                `import test = require("../MyInterface");\n` +
                `async function t() { const u = await import("../MyInterface"); }`);
            const file4 = project.createSourceFile("/file4.ts", `export * from "./sub/MyInterface";\nimport "MyOtherFile";`);

            const referencing = sourceFile.getReferencingLiteralsInOtherSourceFiles();
            expect(referencing.map(r => r.getText()).sort()).to.deep.equal([...[...file1.getImportDeclarations(),
            ...file2.getImportDeclarations(), ...file3.getExportDeclarations()].map(d => d.getModuleSpecifier()!.getText()),
                `"../MyInterface"`, `"../MyInterface"`].sort());
        });
    });

    describe(nameof<SourceFile>(s => s.getReferencingSourceFiles), () => {
        it("should get the source files that reference this source file", () => {
            const fileText = "export interface MyInterface {}";
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface";`);
            const file2 = project.createSourceFile("/sub/file2.ts", `import * as interfaces from "../MyInterface";\nimport "./../MyInterface";`);
            const file3 = project.createSourceFile("/sub/file3.ts", `export * from "../MyInterface";`);
            const file4 = project.createSourceFile("/file4.ts", `export * from "./sub/MyInterface";\nimport "MyOtherFile";`);

            const referencing = sourceFile.getReferencingSourceFiles();
            expect(referencing.map(r => r.getFilePath()).sort()).to.deep.equal([file1, file2, file3].map(s => s.getFilePath()).sort());
        });
    });

    describe(nameof<SourceFile>(s => s.getExtension), () => {
        function doTest(filePath: string, extension: string) {
            const {sourceFile} = getInfoFromText("", { filePath });
            expect(sourceFile.getExtension()).to.equal(extension);
        }

        // most of these tests are in FileUtils
        it("should get the source file's extension when a .ts file", () => {
            doTest("/MyInterface.ts", ".ts");
        });

        it("should get the source file's extension when a .js file", () => {
            doTest("/MyInterface.js", ".js");
        });

        it("should get the source file's extension when a .d.ts file", () => {
            doTest("/MyInterface.d.ts", ".d.ts");
        });
    });

    describe(nameof<SourceFile>(s => s.getBaseNameWithoutExtension), () => {
        function doTest(filePath: string, baseNameWithoutExtension: string) {
            const {sourceFile} = getInfoFromText("", { filePath });
            expect(sourceFile.getBaseNameWithoutExtension()).to.equal(baseNameWithoutExtension);
        }

        it("should get the source file's extension when a .ts file", () => {
            doTest("/MyInterface.ts", "MyInterface");
        });

        it("should get the source file's extension when a .js file", () => {
            doTest("/MyInterface.js", "MyInterface");
        });

        it("should get the source file's extension when a .d.ts file", () => {
            doTest("/MyInterface.d.ts", "MyInterface");
        });
    });

    describe(nameof<SourceFile>(s => s.organizeImports), () => {
        function doTest(fileText: string, otherFiles: { path: string; text: string; }[], expectedText: string) {
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/main.ts" });
            otherFiles.forEach(f => project.createSourceFile(f.path, f.text));
            sourceFile.organizeImports();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should organize imports and remove unused ones", () => {
            const startText = "import MyInterface from './MyInterface';\nimport MyClass from './MyClass';\n" +
                "import UnusedInterface from './UnusedInterface';\n\n" +
                "const myVar: MyInterface = new MyClass();";
            const expectedText = "import MyClass from './MyClass';\nimport MyInterface from './MyInterface';\n\n" +
                "const myVar: MyInterface = new MyClass();";
            doTest(startText, [
                { path: "/MyClass.ts", text: "export default class MyClass {}" },
                { path: "/MyInterface.ts", text: "export default interface MyInterface {}" },
                { path: "/UnusedInterface.ts", text: "export default interface MyUnusedInterface {}" }], expectedText);
        });
    });

    describe(nameof<SourceFile>(s => s.getImportStringLiterals), () => {
        function doTest(fileText: string, expectedLiterals: string[], importHelpers = false) {
            const {sourceFile, project} = getInfoFromText(fileText, { filePath: "/main.ts", compilerOptions: { importHelpers } });
            expect(sourceFile.getImportStringLiterals().map(l => l.getText())).to.deep.equal(expectedLiterals);
        }

        it("should get the string literals used in imports and exports", () => {
            const startText = `import './MyInterface';\nimport MyClass from "./MyClass";\n` +
                `import * as UnusedInterface from "absolute-path";\nexport * from "./export";`;
            doTest(startText, [`'./MyInterface'`, `"./MyClass"`, `"absolute-path"`, `"./export"`]);
        });

        it("should not include the import helpers", () => {
            // need to include code that will generate something like __extends so the import gets added
            const startText = `import './MyInterface';\nclass Base {} class Child extends Base {}`;
            doTest(startText, [`'./MyInterface'`], true);
        });
    });
});
