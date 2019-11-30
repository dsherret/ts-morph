import { expect } from "chai";
import { EmitResult, FileSystemRefreshResult, FormatCodeSettings, SourceFile, VariableDeclarationKind, TextChange } from "../../../../compiler";
import { errors, CompilerOptions, LanguageVariant, ModuleResolutionKind, NewLineKind, ScriptTarget, SyntaxKind } from "@ts-morph/common";
import { IndentationText, ManipulationSettings } from "../../../../options";
import { Project } from "../../../../Project";
import { SourceFileStructure, StructureKind } from "../../../../structures";
import { getFileSystemHostWithFiles } from "../../../testHelpers";
import { getInfoFromText, fillStructures, OptionalKindAndTrivia } from "../../testHelpers";

describe(nameof(SourceFile), () => {
    describe(nameof<SourceFile>(n => n.copy), () => {
        describe("general", () => {
            const fileText = "    interface Identifier {}    ";
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "Folder/File.ts" });
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
            const { sourceFile, project } = getInfoFromText("", { filePath: "/Folder/File.ts" });
            const copiedSourceFile = sourceFile.copy(sourceFile.getFilePath());
            expect(copiedSourceFile).to.equal(sourceFile);
        });

        it("should update the imports and exports in the copied source file", () => {
            const originalText = `import {MyInterface} from "./MyInterface";\nexport * from "./MyInterface";`;
            const { sourceFile, project } = getInfoFromText(originalText, { filePath: "/dir/File.ts" });
            const otherFile = project.createSourceFile("/dir/MyInterface.ts", "export interface MyInterface {}");
            const copiedSourceFile = sourceFile.copy("../NewFile");
            expect(sourceFile.getFullText()).to.equal(originalText);
            expect(copiedSourceFile.getFullText()).to.equal(`import {MyInterface} from "./dir/MyInterface";\nexport * from "./dir/MyInterface";`);
        });

        it("should not update the imports and exports if copying to the same directory", () => {
            // module specifiers are this way to check if they change
            const originalText = `import {MyInterface} from "../dir/MyInterface";\nexport * from "../dir/MyInterface";`;
            const { sourceFile, project } = getInfoFromText(originalText, { filePath: "/dir/File.ts" });
            const otherFile = project.createSourceFile("/dir/MyInterface.ts", "export interface MyInterface {}");
            const copiedSourceFile = sourceFile.copy("NewFile");
            expect(sourceFile.getFullText()).to.equal(originalText);
            expect(copiedSourceFile.getFullText()).to.equal(originalText);
        });

        describe("being in project", () => {
            it("should keep the copied file as being in the project when copying to a directory in the project", () => {
                const { sourceFile } = getInfoFromText("");
                const newFile = sourceFile.copy("newFile.ts");
                expect(newFile._isInProject()).to.be.true;
            });

            it("should keep the copied file as being in the project when copying to a directory not in the project", () => {
                const { sourceFile, project } = getInfoFromText("");
                const rootDir = sourceFile.getDirectory();
                const subDir = rootDir.createDirectory("subDir");
                project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);
                expect(subDir._isInProject()).to.be.false;
                const newFile = sourceFile.copyToDirectory(subDir);
                expect(newFile._isInProject()).to.be.true;
                expect(subDir._isInProject()).to.be.true;
            });

            it("should not mark the out of project copied file as being in the project when copying to a directory not in the project", () => {
                const { sourceFile, project } = getInfoFromText("");
                const rootDir = sourceFile.getDirectory();
                const subDir = rootDir.createDirectory("subDir");
                const subDirFile = subDir.createSourceFile("file.ts");
                project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);
                const newFile = subDirFile.copy("newFile.ts");
                expect(newFile._isInProject()).to.be.false;
            });

            it("should not mark the out of project copied file as being in the project when copying to a directory in the project", () => {
                const { sourceFile, project } = getInfoFromText("");
                const rootDir = sourceFile.getDirectory();
                const subDir = rootDir.createDirectory("subDir");
                const subDirFile = subDir.createSourceFile("file.ts");
                project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);
                const newFile = subDirFile.copy("/newFile.ts");
                expect(newFile._isInProject()).to.be.false;
            });

            it("should mark the out of project copied file as being in the project when overwriting a file in the project", () => {
                const { sourceFile, project } = getInfoFromText("");
                const rootDir = sourceFile.getDirectory();
                const subDir = rootDir.createDirectory("subDir");
                const subDirFile = subDir.createSourceFile("file.ts");
                project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);
                const newFile = subDirFile.copy(sourceFile.getFilePath(), { overwrite: true });
                expect(newFile._isInProject()).to.be.true;
            });
        });
    });

    describe(nameof<SourceFile>(n => n.copyToDirectory), () => {
        it("should copy when passing in an absolute path", () => {
            const { sourceFile } = getInfoFromText("", { filePath: "/File.ts" });
            const newSourceFile = sourceFile.copyToDirectory("newDir");
            expect(sourceFile.getFilePath()).to.equal("/File.ts");
            expect(newSourceFile.getFilePath()).to.equal("/newDir/File.ts");
        });

        it("should copy when passing in a relative path", () => {
            const { sourceFile } = getInfoFromText("", { filePath: "/dir/other/File.ts" });
            expect(sourceFile.copyToDirectory("../newDir").getFilePath()).to.equal("/dir/newDir/File.ts");
        });

        it("should copy when passing in a directory", () => {
            const { sourceFile, project } = getInfoFromText("", { filePath: "/File.ts" });
            const dir = project.createDirectory("/newDir");
            expect(sourceFile.copyToDirectory(dir).getFilePath()).to.equal("/newDir/File.ts");
        });

        it("should copy allowing overwrite", () => {
            const { sourceFile, project } = getInfoFromText("", { filePath: "/File.ts" });
            const originalSourceFile = project.createSourceFile("/newDir/File.ts");
            expect(sourceFile.copyToDirectory("/newDir", { overwrite: true }).getFilePath()).to.equal("/newDir/File.ts");
        });
    });

    describe(nameof<SourceFile>(n => n.copyImmediately), () => {
        it("should copy the source file and update the file system", async () => {
            const { sourceFile, project } = getInfoFromText("", { filePath: "/File.ts" });
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
            const { sourceFile, project } = getInfoFromText("", { filePath: "/File.ts" });
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
            const { sourceFile, project } = getInfoFromText(fileText, { filePath });
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
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile(
                "/file.ts",
                `import {MyInterface} from "./MyInterface";\nasync function t() { const test = await import('./MyInterface'); }`
            );
            const file2 = project.createSourceFile("/sub/file2.ts", `import * as interfaces from "../MyInterface";\nimport "./../MyInterface";`);
            const file3 = project.createSourceFile("/sub/file3.ts", `export * from "../MyInterface";\nimport t = require("./../MyInterface");`);
            const file4Text = `export * from "./sub/MyInterface";\nimport "MyOtherFile";`;
            const file4 = project.createSourceFile("/file4.ts", file4Text);
            sourceFile.move("/dir/NewFile.ts");
            expect(file1.getFullText())
                .to.equal(`import {MyInterface} from "./dir/NewFile";\nasync function t() { const test = await import('./dir/NewFile'); }`);
            expect(file2.getFullText()).to.equal(`import * as interfaces from "../dir/NewFile";\nimport "../dir/NewFile";`);
            expect(file3.getFullText()).to.equal(`export * from "../dir/NewFile";\nimport t = require("../dir/NewFile");`);
            expect(file4.getFullText()).to.equal(file4Text);
        });

        it("should change the module specifiers in other files when moving an index file", () => {
            const fileText = "export interface MyInterface {}";
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/sub/index.ts" });
            const file1 = project.createSourceFile("/file.ts", `import * as test from "./sub";`);
            const file2 = project.createSourceFile("/file2.ts", `import "./sub/index";`);
            sourceFile.move("/dir/index.ts");
            expect(file1.getFullText()).to.equal(`import * as test from "./dir";`);
            expect(file2.getFullText()).to.equal(`import "./dir";`);
        });

        it("should change the module specifiers in the current file when moving", () => {
            const fileText = `import {OtherInterface} from "./OtherInterface";\nexport interface MyInterface {}\nexport * from "./OtherInterface";`;
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const otherFile = project.createSourceFile("/OtherInterface.ts", `import {MyInterface} from "./MyInterface";\nexport interface OtherInterface {}`);
            sourceFile.move("/dir/NewFile.ts");
            expect(sourceFile.getFullText())
                .to.equal(`import {OtherInterface} from "../OtherInterface";\nexport interface MyInterface {}\nexport * from "../OtherInterface";`);
            expect(otherFile.getFullText()).to.equal(`import {MyInterface} from "./dir/NewFile";\nexport interface OtherInterface {}`);
        });

        it("should handle moving two source files to a new directory (issue #314)", () => {
            // there was a bug previously where the moved source file was removed from the list of dirty source files, but it is dirty because
            // the action of moving (removing and adding) to the cache causes the source file to lose its references
            const fileText = `import {OtherInterface} from "./OtherInterface";\nexport interface MyInterface {}\nexport * from "./OtherInterface";`;
            const otherFileText = `import {MyInterface} from "./MyInterface";\nexport interface OtherInterface {}`;
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
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
                expect(sourceFile.getFullText()).to.equal(`import {OtherInterface} from "${otherFileSpecifier}";\n`
                    + `export interface MyInterface {}\nexport * from "${otherFileSpecifier}";`);
                expect(otherFile.getFullText()).to.equal(`import {MyInterface} from "${sourceFileSpecifier}";\nexport interface OtherInterface {}`);
            }
        });

        it("should update a module specifier to a source file that was added after the cache was filled", () => {
            const fileText = `import {Identifier} from "./Identifier";`;
            const { sourceFile, project } = getInfoFromText(fileText);

            // do some command that will fill the internal cache
            sourceFile.getReferencingSourceFiles();

            // now add the source file
            const otherFile = project.createSourceFile("/Identifier.ts", "export class Identifier {}");
            sourceFile.move("/dir/File.ts");

            expect(sourceFile.getFullText()).to.equal(`import {Identifier} from "../Identifier";`);
        });

        it("should update a module specifier to a source file that was moved to the location of the module specifier", () => {
            const fileText = `import {Identifier} from "./Identifier";`;
            const { sourceFile, project } = getInfoFromText(fileText);
            const otherFile = project.createSourceFile("/SomeFile.ts", "export class Identifier {}");

            sourceFile.getReferencingSourceFiles(); // fill internal cache
            otherFile.move("/Identifier.ts");
            sourceFile.move("/dir/File.ts");

            expect(sourceFile.getFullText()).to.equal(`import {Identifier} from "../Identifier";`);
        });

        it("should not change the module specifiers in the current file when moving to the same directory", () => {
            // using a weird module specifier to make sure it doesn't update automatically
            const fileText = `import {OtherInterface} from "../dir/OtherInterface";\nexport interface MyInterface {}\nexport * from "../dir/OtherInterface";`;
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/dir/MyInterface.ts" });
            const otherFile = project.createSourceFile(
                "/dir/OtherInterface.ts",
                `import {MyInterface} from "./MyInterface";\nexport interface OtherInterface {}`
            );
            sourceFile.move("NewFile.ts");
            expect(sourceFile.getFullText()).to.equal(`import {OtherInterface} from "../dir/OtherInterface";\n`
                + `export interface MyInterface {}\n`
                + `export * from "../dir/OtherInterface";`);
            expect(otherFile.getFullText()).to.equal(`import {MyInterface} from "./NewFile";\nexport interface OtherInterface {}`);
        });

        describe("being in the project", () => {
            it("should keep the moved file as being in the project when moving to a directory in the project", () => {
                const { sourceFile } = getInfoFromText("");
                sourceFile.move("newFile.ts");
                expect(sourceFile._isInProject()).to.be.true;
            });

            it("should keep the moved file as being in the project when moving to a directory not in the project and make the directory in the project", () => {
                const { sourceFile, project } = getInfoFromText("");
                const rootDir = sourceFile.getDirectory();
                const subDir = rootDir.createDirectory("subDir");
                project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);
                expect(subDir._isInProject()).to.be.false;
                sourceFile.moveToDirectory(subDir);
                expect(sourceFile._isInProject()).to.be.true;
                expect(subDir._isInProject()).to.be.true;
            });

            it("should not mark the out of project moved file as being in the project when moving to a directory not in the project", () => {
                const { sourceFile, project } = getInfoFromText("");
                const rootDir = sourceFile.getDirectory();
                const subDir = rootDir.createDirectory("subDir");
                const subDirFile = subDir.createSourceFile("file.ts");
                project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);
                subDirFile.move("newFile.ts");
                expect(subDirFile._isInProject()).to.be.false;
            });

            it("should not mark the out of project moved file as being in the project when moving to a directory in the project", () => {
                const { sourceFile, project } = getInfoFromText("");
                const rootDir = sourceFile.getDirectory();
                const subDir = rootDir.createDirectory("subDir");
                const subDirFile = subDir.createSourceFile("file.ts");
                project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);
                subDirFile.move("/newFile.ts");
                expect(subDirFile._isInProject()).to.be.false;
            });

            it("should mark the out of project moved file as being in the project when overwriting a file in the project", () => {
                const { sourceFile, project } = getInfoFromText("");
                const rootDir = sourceFile.getDirectory();
                const subDir = rootDir.createDirectory("subDir");
                const subDirFile = subDir.createSourceFile("file.ts");
                project._context.inProjectCoordinator.setDirectoryAndFilesAsNotInProjectForTesting(subDir);
                subDirFile.move(sourceFile.getFilePath(), { overwrite: true });
                expect(subDirFile._isInProject()).to.be.true;
            });
        });
    });

    describe(nameof<SourceFile>(n => n.moveToDirectory), () => {
        it("should move when passing in an absolute path", () => {
            const { sourceFile } = getInfoFromText("", { filePath: "/File.ts" });
            sourceFile.moveToDirectory("newDir");
            expect(sourceFile.getFilePath()).to.equal("/newDir/File.ts");
        });

        it("should move when passing in a relative path", () => {
            const { sourceFile } = getInfoFromText("", { filePath: "/dir/other/File.ts" });
            sourceFile.moveToDirectory("../newDir");
            expect(sourceFile.getFilePath()).to.equal("/dir/newDir/File.ts");
        });

        it("should move when passing in a directory", () => {
            const { sourceFile, project } = getInfoFromText("", { filePath: "/File.ts" });
            const dir = project.createDirectory("/newDir");
            sourceFile.moveToDirectory(dir);
            expect(sourceFile.getFilePath()).to.equal("/newDir/File.ts");
        });

        it("should move allowing overwrite", () => {
            const { sourceFile, project } = getInfoFromText("", { filePath: "/File.ts" });
            const originalSourceFile = project.createSourceFile("/newDir/File.ts");
            sourceFile.moveToDirectory("/newDir", { overwrite: true });
            expect(sourceFile.getFilePath()).to.equal("/newDir/File.ts");
            expect(originalSourceFile.wasForgotten()).to.be.true;
        });
    });

    describe(nameof<SourceFile>(n => n.moveImmediately), () => {
        it("should move the source file and update the file system", async () => {
            const { sourceFile, project } = getInfoFromText("", { filePath: "/File.ts" });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            await sourceFile.moveImmediately("NewFile.ts");
            expect(fileSystem.fileExistsSync("/File.ts")).to.be.false;
            expect(fileSystem.fileExistsSync("/NewFile.ts")).to.be.true;
        });

        it("should only save source file when moving to the same path", async () => {
            const filePath = "/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const { sourceFile, project } = getInfoFromText("", { filePath, host });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            await sourceFile.moveImmediately(filePath);
            expect(fileSystem.fileExistsSync(filePath)).to.be.true;
            expect(host.getDeleteLog().length).to.equal(0);
        });
    });

    describe(nameof<SourceFile>(n => n.moveImmediatelySync), () => {
        it("should move the source file and update the file system", () => {
            const { sourceFile, project } = getInfoFromText("", { filePath: "/File.ts" });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            sourceFile.moveImmediatelySync("NewFile.ts");
            expect(fileSystem.fileExistsSync("/File.ts")).to.be.false;
            expect(fileSystem.fileExistsSync("/NewFile.ts")).to.be.true;
        });

        it("should only save source file when moving to the same path", () => {
            const filePath = "/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const { sourceFile, project } = getInfoFromText("", { filePath, host });
            const fileSystem = project.getFileSystem();
            project.saveSync();
            sourceFile.moveImmediatelySync(filePath);
            expect(fileSystem.fileExistsSync(filePath)).to.be.true;
            expect(host.getDeleteLog().length).to.equal(0);
        });
    });

    describe(nameof<SourceFile>(n => n.save), () => {
        it("should save the file", async () => {
            const fileText = "    interface Identifier {}    ";
            const filePath = "/Folder/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const { sourceFile } = getInfoFromText(fileText, { filePath, host });
            expect(sourceFile.isSaved()).to.be.false;

            await sourceFile.save();
            expect(sourceFile.isSaved()).to.be.true;
            const writeLog = host.getWriteLog();
            const entry = writeLog[0];
            expect(entry.filePath).to.equal(filePath);
            expect(entry.fileText).to.equal(fileText);
            expect(writeLog.length).to.equal(1);
        });

        it("should write with BOM if read with BOM", async () => {
            const host = getFileSystemHostWithFiles([]);
            const fileText = "const t: string;";
            const encodedFileText = `\uFEFF${fileText}`;
            const { sourceFile } = getInfoFromText(encodedFileText, { filePath: "/file.ts", host });
            await sourceFile.save();
            expect(host.getWriteLog()[0].fileText).to.equal(encodedFileText);
            expect(sourceFile.getFullText()).to.equal(fileText);
        });
    });

    describe(nameof<SourceFile>(n => n.saveSync), () => {
        it("should save the file", () => {
            const fileText = "    interface Identifier {}    ";
            const filePath = "/Folder/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const { sourceFile } = getInfoFromText(fileText, { filePath, host });

            expect(sourceFile.isSaved()).to.be.false;

            sourceFile.saveSync();
            expect(sourceFile.isSaved()).to.be.true;
            const writeLog = host.getWriteLog();
            const entry = writeLog[0];
            expect(entry.filePath).to.equal(filePath);
            expect(entry.fileText).to.equal(fileText);
            expect(writeLog.length).to.equal(1);
        });

        it("should write with BOM if read with BOM", () => {
            const host = getFileSystemHostWithFiles([]);
            const fileText = "const t: string;";
            const encodedFileText = `\uFEFF${fileText}`;
            const { sourceFile } = getInfoFromText(encodedFileText, { filePath: "/file.ts", host });
            sourceFile.saveSync();
            expect(host.getWriteLog()[0].fileText).to.equal(encodedFileText);
            expect(sourceFile.getFullText()).to.equal(fileText);
        });
    });

    describe(nameof<SourceFile>(n => n.delete), () => {
        it("should delete the file once save changes is called", async () => {
            const filePath = "/Folder/File.ts";
            const host = getFileSystemHostWithFiles([]);
            const { sourceFile, project } = getInfoFromText("", { filePath, host });
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
        const { sourceFile } = getInfoFromText("", { filePath, host });
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
        const { sourceFile } = getInfoFromText("", { filePath, host });
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
            const { sourceFile } = getInfoFromText("class MyClass {}", { filePath, host });
            expect(sourceFile.isSaved()).to.be.false;
            sourceFile.saveSync();
            expect(sourceFile.isSaved()).to.be.true;
            sourceFile.addClass({ name: "NewClass" });
            expect(sourceFile.isSaved()).to.be.false;
        });

        it("should not be saved after doing an action that changes only the text", () => {
            const host = getFileSystemHostWithFiles([]);
            const { sourceFile } = getInfoFromText("class MyClass {}", { filePath, host });
            expect(sourceFile.isSaved()).to.be.false;
            sourceFile.saveSync();
            expect(sourceFile.isSaved()).to.be.true;
            sourceFile.getClasses()[0].rename("NewClassName");
            expect(sourceFile.isSaved()).to.be.false;
        });
    });

    describe(nameof<SourceFile>(n => n.isDeclarationFile), () => {
        it("should be a source file when the file name ends with .d.ts", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile("MyFile.d.ts", "");
            expect(sourceFile.isDeclarationFile()).to.be.true;
        });

        it("should not be a source file when the file name ends with .ts", () => {
            const project = new Project({ useInMemoryFileSystem: true });
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
            const { librarySourceFile } = trueSetup();
            expect(librarySourceFile.isFromExternalLibrary()).to.be.true;
        });

        it("should not be for a referenced file", () => {
            const { referencedSourceFile } = trueSetup();
            // I would have thought this would return true, but it returns false...
            // todo: write up a simple example and report this in the TypeScript repo
            expect(referencedSourceFile.isFromExternalLibrary()).to.be.false;
        });

        it("should be after manipulating the file", () => {
            const { librarySourceFile } = trueSetup();
            librarySourceFile.addStatements("console;");
            expect(librarySourceFile.isFromExternalLibrary()).to.be.true;
        });

        function trueSetup() {
            const fileSystem = getFileSystemHostWithFiles([
                { filePath: "package.json", text: `{ "name": "testing", "version": "0.0.1" }` },
                {
                    filePath: "node_modules/library/package.json",
                    text: `{ "name": "library", "version": "0.0.1", "main": "index.js", `
                        + `"typings": "index.d.ts", "typescript": { "definition": "index.d.ts" } }`
                },
                { filePath: "node_modules/library/index.js", text: "export class Test {}" },
                { filePath: "node_modules/library/index.d.ts", text: "export class Test {}" },
                { filePath: "node_modules/other/referenced-file.d.ts", text: "declare function nameof(): void;" }
            ], ["node_modules", "node_modules/library"]);
            const fileText = "/// <reference path='node_modules/other/referenced-file.d.ts' />\n\nimport { Test } from 'library';";
            const { sourceFile, project } = getInfoFromText(fileText, { host: fileSystem });
            const librarySourceFile = sourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFileOrThrow();
            const referencedSourceFile = project.getSourceFileOrThrow("node_modules/other/referenced-file.d.ts");
            return { librarySourceFile, referencedSourceFile };
        }
    });

    describe(nameof<SourceFile>(n => n.isInNodeModules), () => {
        it("should not be when not", () => {
            const { sourceFile } = getInfoFromText("", { filePath: "/main.ts" });
            expect(sourceFile.isInNodeModules()).to.be.false;
        });

        it("should be when is", () => {
            const { sourceFile } = getInfoFromText("", { filePath: "/node_modules/library/main.d.ts" });
            expect(sourceFile.isInNodeModules()).to.be.true;
        });
    });

    describe(nameof<SourceFile>(n => n.getLanguageVariant), () => {
        it("should return standard when in a ts file", () => {
            const { sourceFile } = getInfoFromText("");
            expect(sourceFile.getLanguageVariant()).to.equal(LanguageVariant.Standard);
        });

        it("should return jsx when in a tsx file", () => {
            const { sourceFile } = getInfoFromText("", { filePath: "file.tsx" });
            expect(sourceFile.getLanguageVariant()).to.equal(LanguageVariant.JSX);
        });
    });

    describe(nameof<SourceFile>(n => n.emit), () => {
        async function doTest(emit: (sourceFile: SourceFile) => Promise<EmitResult>) {
            const fileSystem = getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions: { noLib: true, outDir: "dist" }, fileSystem });
            const sourceFile = project.createSourceFile("file1.ts", "const num1 = 1;");
            project.createSourceFile("file2.ts", "const num2 = 2;");
            const result = await emit(sourceFile);

            expect(result).to.be.instanceof(EmitResult);
            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog.length).to.equal(1);
        }

        it("should emit the source file asynchronously", async () => {
            doTest(sourceFile => sourceFile.emit());
        });

        it("should emit the source file synchronously", async () => {
            doTest(sourceFile => Promise.resolve(sourceFile.emitSync()));
        });
    });

    describe(nameof<SourceFile>(n => n.getEmitOutput), () => {
        it("should get the emit output for the source file", () => {
            const project = new Project({ compilerOptions: { noLib: true, outDir: "dist", target: ScriptTarget.ES5 }, useInMemoryFileSystem: true });
            const sourceFile = project.createSourceFile("file1.ts", "const num1 = 1;");
            const result = sourceFile.getEmitOutput();

            expect(result.getEmitSkipped()).to.be.false;
            expect(result.getOutputFiles().length).to.equal(1);
            const outputFile = result.getOutputFiles()[0];
            expect(outputFile.getText()).to.equal("var num1 = 1;\n");
            expect(outputFile.getFilePath()).to.equal("/dist/file1.js");
        });

        it("should only emit the declaration file when specified", () => {
            const project = new Project({
                compilerOptions: { noLib: true, declaration: true, outDir: "dist", target: ScriptTarget.ES5 },
                useInMemoryFileSystem: true
            });
            const sourceFile = project.createSourceFile("file1.ts", "const num1 = 1;");
            const result = sourceFile.getEmitOutput({ emitOnlyDtsFiles: true });

            expect(result.getEmitSkipped()).to.be.false;
            expect(result.getOutputFiles().length).to.equal(1);
            const outputFile = result.getOutputFiles()[0];
            expect(outputFile.getFilePath()).to.equal("/dist/file1.d.ts");
        });
    });

    describe(nameof<SourceFile>(n => n.set), () => {
        function doTest(startingCode: string, structure: Partial<SourceFileStructure>, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startingCode);
            sourceFile.set(structure);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should not modify anything if the structure doesn't change anything", () => {
            const code = "import t from 'test'; export * from 'test';";
            doTest(code, {}, code);
        });

        it("should modify when changed", () => {
            const structure: OptionalKindAndTrivia<MakeRequired<SourceFileStructure>> = {
                statements: [
                    { kind: StructureKind.ImportDeclaration, moduleSpecifier: "module" },
                    { kind: StructureKind.Class, name: "C" },
                    "console.log()",
                    { kind: StructureKind.ExportDeclaration, moduleSpecifier: "export-module" },
                    { kind: StructureKind.ExportAssignment, expression: "5" }
                ]
            };
            doTest("", structure, `import "module";\n\nclass C {\n}\n\nconsole.log()\nexport * from "export-module";\nexport = 5;\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.formatText), () => {
        function doTest(
            startingCode: string,
            expectedCode: string,
            manipulationSettings: Partial<ManipulationSettings> = {},
            settings: FormatCodeSettings = {}
        ) {
            const { project, sourceFile } = getInfoFromText(startingCode);
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
            doTest(
                "class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\n        myMethod() {\n        }\n}\n",
                { indentationText: IndentationText.EightSpaces }
            );
        });

        it("should format the text with four spaces", () => {
            doTest(
                "class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\n    myMethod() {\n    }\n}\n",
                { indentationText: IndentationText.FourSpaces }
            );
        });

        it("should format the text with two spaces", () => {
            doTest(
                "class MyClass {\n    myMethod() {\n        console.log(t);\n    }\n}",
                "class MyClass {\n  myMethod() {\n    console.log(t);\n  }\n}\n",
                { indentationText: IndentationText.TwoSpaces }
            );
        });

        it("should format the text with tabs", () => {
            doTest(
                "class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\n\tmyMethod() {\n\t}\n}\n",
                { indentationText: IndentationText.Tab }
            );
        });

        it("should format the text to spaces when using tabs", () => {
            doTest(
                "class MyClass {\n\tmyMethod() {\n\t}\n}",
                "class MyClass {\n  myMethod() {\n  }\n}\n",
                { indentationText: IndentationText.TwoSpaces }
            );
        });

        it("should format the text with slash r slash n newlines", () => {
            doTest(
                "class MyClass {\n    myMethod() {\n    }\n}",
                "class MyClass {\r\n\tmyMethod() {\r\n\t}\r\n}\r\n",
                { indentationText: IndentationText.Tab, newLineKind: NewLineKind.CarriageReturnLineFeed }
            );
        });

        it("should format the text with slash n newlines", () => {
            doTest(
                "class MyClass {\r\n    myMethod() {\r\n    }\r\n}",
                "class MyClass {\n\tmyMethod() {\n\t}\n}\n",
                { indentationText: IndentationText.Tab, newLineKind: NewLineKind.LineFeed }
            );
        });

        it("should format and not indent within strings", () => {
            doTest(
                "class MyClass {\n    myMethod() {\n        const t = `\nt`;\n    }\n}",
                "class MyClass {\n  myMethod() {\n    const t = `\nt`;\n  }\n}\n",
                { indentationText: IndentationText.TwoSpaces }
            );
        });

        it("should format and not format within strings", () => {
            doTest(
                "class MyClass {\n    myMethod() {\n        const t = `\n    t`;\n    }\n}",
                "class MyClass {\n\tmyMethod() {\n\t\tconst t = `\n    t`;\n\t}\n}\n",
                { indentationText: IndentationText.Tab }
            );
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
            const { sourceFile } = getInfoFromText(startingCode);
            sourceFile.indent(rangeOrPos, times);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should throw when the range is outside the lower bound of the file", () => {
            const { sourceFile } = getInfoFromText(" ");
            expect(() => sourceFile.indent([-1, 0])).to.throw();
        });

        it("should throw when the range is outside the upper bound of the file", () => {
            const { sourceFile } = getInfoFromText(" ");
            expect(() => sourceFile.indent([0, 2])).to.throw();
        });

        it("should throw when the range is flipped", () => {
            const { sourceFile } = getInfoFromText("     ");
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
            doTest(
                sourceFileLines.join("\n"),
                [sourceFileLines[0].length + 1, sourceFileLines[0].length + 1 + sourceFileLines[1].length],
                3,
                `class MyClass {
                test;
}`
            );
        });

        it("should indent the line when specifying the end of it for the start of the range", () => {
            const sourceFileLines = ["class MyClass {", "    test;", "}"];
            doTest(
                sourceFileLines.join("\n"),
                [sourceFileLines[0].length, sourceFileLines[0].length + 1],
                1,
                `    class MyClass {
        test;
}`
            );
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
            const { sourceFile } = getInfoFromText("//code");
            sourceFile._context.manipulationSettings.set({ indentationText: IndentationText.TwoSpaces });
            sourceFile.indent(0);
            expect(sourceFile.getFullText()).to.equal("  //code");
        });

        it("should indent when specifying tabs", () => {
            const { sourceFile } = getInfoFromText("//code");
            sourceFile._context.manipulationSettings.set({ indentationText: IndentationText.Tab });
            sourceFile.indent(0);
            expect(sourceFile.getFullText()).to.equal("\t//code");
        });
    });

    describe(nameof<SourceFile>(n => n.unindent), () => {
        // most of the tests are in indent
        function doTest(startingCode: string, rangeOrPos: [number, number] | number, times: number, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startingCode);
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
            const { sourceFile, firstChild } = getInfoFromText("class MyClass {}", { filePath, host });
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
            const { sourceFile } = getInfoFromText("class MyClass {}", { filePath, host });
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
            const { sourceFile, firstChild } = getInfoFromText("class MyClass {}", { filePath, host });
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
            const { sourceFile } = getInfoFromText("class MyClass {}", { filePath, host });
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
            const project = new Project({ useInMemoryFileSystem: true });
            const fromFile = project.createSourceFile(from);
            const toFile = project.createSourceFile(to);
            expect(fromFile.getRelativePathTo(toFile)).to.equal(expected);
        }

        // most of these tests are in fileUtilsTests

        it("should get the relative path to a source file in a different directory", () => {
            doSourceFileTest("/dir/from.ts", "/dir2/to.ts", "../dir2/to.ts");
        });

        function doDirTest(from: string, to: string, expected: string) {
            const project = new Project({ useInMemoryFileSystem: true });
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
            const project = new Project({ useInMemoryFileSystem: true, compilerOptions });
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

        it("should get the module specifier to a declaration file", () => {
            doSourceFileTest("/dir/from.ts", "/dir2/to.d.ts", "../dir2/to");
        });

        it("should get the module specifier to a declaration file that doing use a lower case extension", () => {
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

        it("should use an implicit index when specifying the index file of a declaration file in a different directory", () => {
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
            const project = new Project({ useInMemoryFileSystem: true, compilerOptions });
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
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface";`);
            const file2 = project.createSourceFile("/sub/file2.ts", `import * as interfaces from "../MyInterface";\nimport "./../MyInterface";`);
            const file3 = project.createSourceFile("/sub/file3.ts", `export * from "../MyInterface";\n`
                + `import test = require("../MyInterface");\n`
                + `async function t() { const u = await import("../MyInterface"); }`);
            const file4 = project.createSourceFile("/file4.ts", `export * from "./sub/MyInterface";\nimport "MyOtherFile";`);

            const referencing = sourceFile.getReferencingNodesInOtherSourceFiles();
            expect(referencing.map(r => r.getText()).sort())
                .to.deep.equal([
                    ...[...file1.getImportDeclarations(), ...file2.getImportDeclarations(), ...file3.getExportDeclarations()].map(d => d.getText()),
                    `import test = require("../MyInterface");`,
                    `import("../MyInterface")`
                ].sort());
        });

        it("should get the nodes that reference an index file", () => {
            const fileText = "export interface MyInterface {}";
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/sub/index.ts" });
            const file1 = project.createSourceFile("/file.ts", `export * from "./sub";`);
            const file2 = project.createSourceFile("/file2.ts", `import "./sub/index";`);
            const referencing = sourceFile.getReferencingNodesInOtherSourceFiles();
            expect(referencing.map(r => r.getText()).sort())
                .to.deep.equal([
                    ...file1.getExportDeclarations(),
                    ...file2.getImportDeclarations()
                ].map(d => d.getText()).sort());
        });

        it("should keep the references up to date during manipulations", () => {
            const { sourceFile, project } = getInfoFromText("export class MyClass {}", { filePath: "/MyClass.ts" });
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
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface";`);
            const file2 = project.createSourceFile("/sub/file2.ts", `import * as interfaces from "../MyInterface";\nimport "./../MyInterface";`);
            const file3 = project.createSourceFile("/sub/file3.ts", `export * from "../MyInterface";\n`
                + `import test = require("../MyInterface");\n`
                + `async function t() { const u = await import("../MyInterface"); }`);
            const file4 = project.createSourceFile("/file4.ts", `export * from "./sub/MyInterface";\nimport "MyOtherFile";`);

            const referencing = sourceFile.getReferencingLiteralsInOtherSourceFiles();
            expect(referencing.map(r => r.getText()).sort())
                .to.deep.equal([
                    ...[...file1.getImportDeclarations(), ...file2.getImportDeclarations(), ...file3.getExportDeclarations()]
                        .map(d => d.getModuleSpecifier()!.getText()),
                    `"../MyInterface"`,
                    `"../MyInterface"`
                ].sort());
        });
    });

    describe(nameof<SourceFile>(s => s.getReferencingSourceFiles), () => {
        it("should get the source files that reference this source file", () => {
            const fileText = "export interface MyInterface {}";
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface";`);
            const file2 = project.createSourceFile("/sub/file2.ts", `import * as interfaces from "../MyInterface";\nimport "./../MyInterface";`);
            const file3 = project.createSourceFile("/sub/file3.ts", `export * from "../MyInterface";`);
            const file4 = project.createSourceFile("/file4.ts", `export * from "./sub/MyInterface";\nimport "MyOtherFile";`);

            const referencing = sourceFile.getReferencingSourceFiles();
            expect(referencing.map(r => r.getFilePath()).sort()).to.deep.equal([file1, file2, file3].map(s => s.getFilePath()).sort());
        });
    });

    describe(nameof<SourceFile>(s => s.getReferencedSourceFiles), () => {
        function expectResult(file: SourceFile, expectedSourceFiles: SourceFile[]) {
            expect(file.getReferencedSourceFiles().map(r => r.getFilePath()).sort())
                .to.deep.equal(expectedSourceFiles.map(s => s.getFilePath()).sort());
        }

        it("should get the source files that this source file references", () => {
            const fileText = "export interface MyInterface {}";
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface"; export * from "../MyInterface";`);
            const file2 = project.createSourceFile("/file2.ts", `import {MyInterface} from "./MyInterface";`);
            const file3 = project.createSourceFile("/file3.ts", `export * from "./MyInterface";`);
            const file4 = project.createSourceFile("/file4.ts", `const t = import("./MyInterface");`);

            expectResult(sourceFile, []);
            expectResult(file1, [sourceFile]);
            expectResult(file2, [sourceFile]);
            expectResult(file3, [sourceFile]);
            expectResult(file4, [sourceFile]);
        });
    });

    describe(nameof<SourceFile>(s => s.getNodesReferencingOtherSourceFiles), () => {
        function expectResult(file: SourceFile, expectedNodes: string[]) {
            expect(file.getNodesReferencingOtherSourceFiles().map(n => n.getText()).sort())
                .to.deep.equal(expectedNodes.sort());
        }

        it("should get the nodes in this source file that reference other source files", () => {
            const fileText = "export interface MyInterface {}";
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface"; export * from "../MyInterface";`);
            const file2 = project.createSourceFile("/file2.ts", `import {MyInterface} from "./MyInterface";`);
            const file3 = project.createSourceFile("/file3.ts", `export * from "./MyInterface";`);
            const file4 = project.createSourceFile("/file4.ts", `const t = import("./MyInterface");`);

            expectResult(sourceFile, []);
            expectResult(file1, [`import {MyInterface} from "./MyInterface";`, `export * from "../MyInterface";`]);
            expectResult(file2, [`import {MyInterface} from "./MyInterface";`]);
            expectResult(file3, [`export * from "./MyInterface";`]);
            expectResult(file4, [`import("./MyInterface")`]);
        });
    });

    describe(nameof<SourceFile>(s => s.getLiteralsReferencingOtherSourceFiles), () => {
        function expectResult(file: SourceFile, expectedNodes: string[]) {
            expect(file.getLiteralsReferencingOtherSourceFiles().map(n => n.getText()).sort())
                .to.deep.equal(expectedNodes.sort());
        }

        it("should get the nodes in this source file that reference other source files", () => {
            const fileText = "export interface MyInterface {}";
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/MyInterface.ts" });
            const file1 = project.createSourceFile("/file.ts", `import {MyInterface} from "./MyInterface"; export * from "../MyInterface";`);
            const file2 = project.createSourceFile("/file2.ts", `import {MyInterface} from "./MyInterface";`);
            const file3 = project.createSourceFile("/file3.ts", `export * from "./MyInterface";`);
            const file4 = project.createSourceFile("/file4.ts", `const t = import("./MyInterface");`);

            expectResult(sourceFile, []);
            expectResult(file1, [`"./MyInterface"`, `"../MyInterface"`]);
            expectResult(file2, [`"./MyInterface"`]);
            expectResult(file3, [`"./MyInterface"`]);
            expectResult(file4, [`"./MyInterface"`]);
        });
    });

    describe(nameof<SourceFile>(s => s.getExtension), () => {
        function doTest(filePath: string, extension: string) {
            const { sourceFile } = getInfoFromText("", { filePath });
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
            const { sourceFile } = getInfoFromText("", { filePath });
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
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "/main.ts" });
            otherFiles.forEach(f => project.createSourceFile(f.path, f.text));
            sourceFile.organizeImports();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should organize imports and remove unused ones", () => {
            const startText = "import MyInterface from './MyInterface';\nimport MyClass from './MyClass';\n"
                + "import UnusedInterface from './UnusedInterface';\n\n"
                + "const myVar: MyInterface = new MyClass();";
            const expectedText = "import MyClass from './MyClass';\nimport MyInterface from './MyInterface';\n\n"
                + "const myVar: MyInterface = new MyClass();";
            doTest(startText, [
                { path: "/MyClass.ts", text: "export default class MyClass {}" },
                { path: "/MyInterface.ts", text: "export default interface MyInterface {}" },
                { path: "/UnusedInterface.ts", text: "export default interface MyUnusedInterface {}" }
            ], expectedText);
        });
    });

    describe(nameof<SourceFile>(s => s.fixMissingImports), () => {
        function doTest(fileText: string, otherFiles: { path: string; text: string; }[], expectedText: string, formatSettings?: FormatCodeSettings) {
            const { sourceFile, project } = getInfoFromText(fileText, { filePath: "./main.ts" });
            otherFiles.forEach(f => project.createSourceFile(f.path, f.text));
            sourceFile.getDescendants(); // wrap everything to test adding the new nodes when everything is wrapped
            sourceFile.fixMissingImports(formatSettings);
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should add missing imports when there are none", () => {
            const startText = "const t = new MyClass();\nconst u: MyInterface = {};";
            const expectedText = `import MyClass from "./MyClass";\nimport { MyInterface } from "./MyInterface";\n\n${startText}`;
            doTest(startText, [
                { path: "/MyClass.ts", text: "export default class MyClass {}" },
                { path: "/MyInterface.ts", text: "export interface MyInterface {}" }
            ], expectedText);
        });

        it("should add missing imports when there are none when using \r\n newlines", () => {
            const startText = "const t = new MyClass();\nconst u: MyInterface = {};";
            const expectedText = `import MyClass from "./MyClass";\r\nimport { MyInterface } from "./MyInterface";\r\n\r\n${startText}`;
            doTest(startText, [
                { path: "/MyClass.ts", text: "export default class MyClass {}" },
                { path: "/MyInterface.ts", text: "export interface MyInterface {}" }
            ], expectedText, {
                newLineCharacter: "\r\n"
            });
        });

        it("should add missing imports when some exist", () => {
            const startText = `import MyClass from "./MyClass";\n\nconst t = new MyClass();\nconst u: MyInterface = {};`;
            const expectedText = `import MyClass from "./MyClass";\nimport { MyInterface } from "./MyInterface";\n\nconst t = new MyClass();\nconst u: MyInterface = {};`;
            doTest(startText, [
                { path: "/MyClass.ts", text: "export default class MyClass {}" },
                { path: "/MyInterface.ts", text: "export interface MyInterface {}" }
            ], expectedText);
        });

        it("should do nothing when both exist", () => {
            const startText = `import MyClass from "./MyClass";\nimport { MyInterface } from "./MyInterface";\n\nconst t = new MyClass();\nconst u: MyInterface = {};`;
            const expectedText = startText;
            doTest(startText, [
                { path: "/MyClass.ts", text: "export default class MyClass {}" },
                { path: "/MyInterface.ts", text: "export interface MyInterface {}" }
            ], expectedText);
        });

        it("should add missing ones in existing named imports", () => {
            const startText = `import { MyClass } from "./MyClass";\n\nconst t = new MyClass();\nconst u: MyInterface = {};\nconst v = new MyClass2();\nconst w = new MyClass3()`;
            const expectedText = `import { MyClass, MyClass2, MyClass3 } from "./MyClass";\nimport { MyInterface } from "./MyInterface";\n\nconst t = new MyClass();\n`
                + `const u: MyInterface = {};\nconst v = new MyClass2();\nconst w = new MyClass3()`;
            doTest(startText, [
                { path: "/MyClass.ts", text: "export class MyClass {} export class MyClass2 {} export class MyClass3 {}" },
                { path: "/MyInterface.ts", text: "export interface MyInterface {}" }
            ], expectedText);
        });

        it("should not forget nodes", () => {
            const startText = `import { MyClass } from "./MyClass";\n\nconst t = new MyClass();\nconst u: MyInterface = {};\nconst v = new MyClass2();\nconst w = new MyClass3()`;
            const { sourceFile, project } = getInfoFromText(startText);
            project.createSourceFile("/MyClass.ts", "export class MyClass {} export class MyClass2 {} export class MyClass3 {}");
            project.createSourceFile("/MyInterface.ts", "export interface MyInterface {}");
            const w = sourceFile.getVariableDeclaration("w")!.getFirstDescendantByKindOrThrow(SyntaxKind.Identifier);
            const i = sourceFile.getImportDeclarations()[0];
            sourceFile.fixMissingImports();
            expect(w.wasForgotten()).to.be.false;
            expect(i.wasForgotten()).to.be.false;
        });
    });

    describe(nameof<SourceFile>(s => s.getImportStringLiterals), () => {
        function doTest(fileText: string, expectedLiterals: string[], importHelpers = false) {
            const { sourceFile } = getInfoFromText(fileText, { filePath: "/main.ts", compilerOptions: { importHelpers } });
            expect(sourceFile.getImportStringLiterals().map(l => l.getText())).to.deep.equal(expectedLiterals);
        }

        it("should get the string literals used in imports and exports", () => {
            const startText = `import './MyInterface';\nimport MyClass from "./MyClass";\n`
                + `import * as UnusedInterface from "absolute-path";\nexport * from "./export";`;
            doTest(startText, [`'./MyInterface'`, `"./MyClass"`, `"absolute-path"`, `"./export"`]);
        });

        it("should not include the import helpers", () => {
            // need to include code that will generate something like __extends so the import gets added
            const startText = `import './MyInterface';\nclass Base {} class Child extends Base {}`;
            doTest(startText, [`'./MyInterface'`], true);
        });
    });

    describe(nameof<SourceFile>(s => s.getPathReferenceDirectives), () => {
        it("should get when they exist", () => {
            const { sourceFile } = getInfoFromText("/// <reference path='file.d.ts' />");
            const referencedFiles = sourceFile.getPathReferenceDirectives();
            expect(referencedFiles.map(f => f.getFileName())).to.deep.equal(["file.d.ts"]);
        });

        it("should forget them after a manipulation", () => {
            const { sourceFile } = getInfoFromText("/// <reference path='file.d.ts' />");
            const referencedFiles = sourceFile.getPathReferenceDirectives();
            sourceFile.replaceWithText("");
            expect(referencedFiles[0].wasForgotten()).to.be.true;
            expect(sourceFile.getPathReferenceDirectives().length).to.equal(0);
        });
    });

    describe(nameof<SourceFile>(s => s.getTypeReferenceDirectives), () => {
        it("should get when they exist", () => {
            const { sourceFile } = getInfoFromText("/// <reference types='file.d.ts' />");
            const typeReferenceDirectives = sourceFile.getTypeReferenceDirectives();
            expect(typeReferenceDirectives.map(f => f.getFileName())).to.deep.equal(["file.d.ts"]);
        });

        it("should forget them after a manipulation", () => {
            const { sourceFile } = getInfoFromText("/// <reference types='es2017.string' />");
            const directives = sourceFile.getTypeReferenceDirectives();
            sourceFile.replaceWithText("");
            expect(directives[0].wasForgotten()).to.be.true;
            expect(sourceFile.getTypeReferenceDirectives().length).to.equal(0);
        });
    });

    describe(nameof<SourceFile>(s => s.applyTextChanges), () => {
        // there are more tests for this functionality elsewhere... this is just testing the applyTextChanges api

        it("should apply the file text change when using a wrapped object", () => {
            const { sourceFile } = getInfoFromText("test;");
            const change = new TextChange({ newText: "console;", span: { start: 0, length: 0 } });
            sourceFile.applyTextChanges([change]);
            expect(sourceFile.getText()).to.equal("console;test;");
        });

        it("should apply the file text change when using a compiler object", () => {
            const { sourceFile } = getInfoFromText("test;");
            sourceFile.applyTextChanges([
                { newText: "console;", span: { start: 0, length: 0 } },
                { newText: "asdf;", span: { start: 0, length: 5 } }
            ]);
            expect(sourceFile.getText()).to.equal("console;asdf;");
        });
    });

    describe(nameof<SourceFile>(s => s.getLibReferenceDirectives), () => {
        it("should get when they exist", () => {
            const { sourceFile } = getInfoFromText("/// <reference lib='es2017.string' />");
            const directives = sourceFile.getLibReferenceDirectives();
            expect(directives.map(f => f.getFileName())).to.deep.equal(["es2017.string"]);
        });

        it("should forget them after a manipulation", () => {
            const { sourceFile } = getInfoFromText("/// <reference lib='es2017.string' />");
            const directives = sourceFile.getLibReferenceDirectives();
            sourceFile.replaceWithText("");
            expect(directives[0].wasForgotten()).to.be.true;
            expect(sourceFile.getLibReferenceDirectives().length).to.equal(0);
        });
    });

    describe(nameof<SourceFile>(s => s.getStructure), () => {
        function doTest(fileText: string, expected: SourceFileStructure) {
            const { sourceFile } = getInfoFromText(fileText);
            expect(sourceFile.getStructure()).to.deep.equal(expected);
        }

        it("should only get the statements", () => {
            const startText = `import {I} from './I';
export class A implements I {}
class B extends A {}
export interface J extends I {}
interface K extends J {}
export function f(){}
function g(){}
export type T = any;
export enum U {}
namespace ns{interface nsi{}}
const t = 5;`;

            doTest(startText, {
                kind: StructureKind.SourceFile,
                statements: [fillStructures.importDeclaration({
                    namedImports: [fillStructures.importSpecifier({ name: "I" })],
                    moduleSpecifier: "./I"
                }), fillStructures.classDeclaration({
                    isExported: true,
                    name: "A",
                    implements: ["I"]
                }), fillStructures.classDeclaration({
                    name: "B",
                    extends: "A"
                }), fillStructures.interfaceDeclaration({
                    isExported: true,
                    name: "J",
                    extends: ["I"]
                }), fillStructures.interfaceDeclaration({
                    name: "K",
                    extends: ["J"]
                }), fillStructures.functionDeclaration({
                    isExported: true,
                    name: "f",
                    overloads: [],
                    statements: []
                }), fillStructures.functionDeclaration({
                    name: "g",
                    overloads: [],
                    statements: []
                }), fillStructures.typeAlias({
                    isExported: true,
                    name: "T",
                    type: "any"
                }), fillStructures.enumDeclaration({
                    isExported: true,
                    name: "U"
                }), fillStructures.namespaceDeclaration({
                    name: "ns",
                    statements: [fillStructures.interfaceDeclaration({
                        name: "nsi"
                    })]
                }), fillStructures.variableStatement({
                    declarationKind: VariableDeclarationKind.Const,
                    declarations: [fillStructures.variableDeclaration({
                        name: "t",
                        initializer: "5"
                    })]
                })]
            });
        });
    });

    describe(nameof<SourceFile>(n => n.getLineAndColumnAtPos), () => {
        function doTest(code: string, pos: number, expected: { line: number; column: number; } | "throw") {
            const { sourceFile } = getInfoFromText(code);
            if (expected === "throw")
                expect(() => sourceFile.getLineAndColumnAtPos(pos)).to.throw();
            else
                expect(sourceFile.getLineAndColumnAtPos(pos)).to.deep.equal(expected);
        }

        it("should return line and column numbers at given position in single line source files", () => {
            doTest(``, 0, { line: 1, column: 1 });
            const code = `interface I { m1(): void }`;
            doTest(code, 3, { line: 1, column: 4 });
            doTest(code, 0, { line: 1, column: 1 });
            doTest(code, code.length, { line: 1, column: code.length + 1 });
        });

        it("should return line and column numbers at given position in empty first line source files", () => {
            const code = `\ninterface I { m1(): void }`;
            doTest(code, 0, { line: 1, column: 1 });
            doTest(code, 1, { line: 2, column: 1 });
            doTest(code, code.length, { line: 2, column: code.length });
        });

        it("should return line and column numbers at given position in multiple lines and comments source file", () => {
            const code = `
/**
 * Lorem ipsum
 */
interface I {
}
// tail
`;
            doTest(code, 0, { line: 1, column: 1 });
            doTest(code, 1, { line: 2, column: 1 });
            doTest(code, code.indexOf("Lorem ipsum") - 3, { line: 3, column: 1 });
            doTest(code, code.indexOf("Lorem ipsum") + "Lorem ipsum".length, { line: 3, column: " * Lorem ipsum".length + 1 });
            doTest(code, code.indexOf("// tail") + "// tail".length, { line: 7, column: 8 });
            doTest(code, code.indexOf("// tail") + "// tail".length + 1, { line: 8, column: 1 });
        });

        it("should throw for invalid positions", () => {
            doTest(`var a = 1`, `var a = 1`.length + 1, "throw");
            doTest(``, 1, "throw");
            doTest(`interface I { m1(): void }`, 1000, "throw");
            doTest(`\ninterface I {\n m1(): void }`, -1, "throw");
        });
    });

    describe(nameof<SourceFile>(l => l.fixUnusedIdentifiers), () => {
        function doTest(code: string, expected: string) {
            const { sourceFile, project } = getInfoFromText(code);
            sourceFile.fixUnusedIdentifiers();
            sourceFile.fixUnusedIdentifiers();
            expect(sourceFile.getText().trim()).to.equals(expected.trim());
            return { sourceFile, project };
        }

        it("should remove unused import declarations, import names, and default imports", () => {
            doTest(`
import {foo} from 'foo'
import * as a from 'a'
import b from 'b'
import {used, unused} from 'bar'
export const c = used + 1
export function f(...args: any[]) {
    var a
    const c
    const {x, y, z} = {x: 1, y: 1, z: 1}
    return y + c
}
export class C<T> {
    private constructor(a: number, b: Date) { this.a = a; this.b = b }
    private m() { }
    private b: Date
    private a = 1
    protected n({a, b, c}: {a: number, b: string, c: boolean}) { return this.b.getTime() + a }
}
export type T<S, V> = V extends string ? : never : any
            `, `
import {used} from 'bar'
export const c = used + 1
export function f() {
    const c
    const {y} = {x: 1, y: 1, z: 1}
    return y + c
}
export class C {
    private constructor(b: Date) { this.b = b }
    private b: Date
    protected n({a}: {a: number, b: string, c: boolean}) { return this.b.getTime() + a }
}
export type T<V> = V extends string ? : never : any
            `);
        });
    });
});
