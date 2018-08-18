import { expect } from "chai";
import * as path from "path";
import { ClassDeclaration, EmitResult, InterfaceDeclaration, NamespaceDeclaration, Node, SourceFile } from "../compiler";
import * as errors from "../errors";
import { VirtualFileSystemHost } from "../fileSystem";
import { IndentationText } from "../options";
import { Project } from "../Project";
import { SourceFileStructure } from "../structures";
import { CompilerOptions, ScriptTarget, SyntaxKind, ts } from "../typescript";
import * as testHelpers from "./testHelpers";

console.log("");
console.log("TypeScript version: " + ts.version);

describe(nameof(Project), () => {
    describe("constructor", () => {
        it("should set the manipulation settings if provided", () => {
            const project = new Project({
                manipulationSettings: {
                    indentationText: IndentationText.EightSpaces
                }
            });

            expect(project.manipulationSettings.getIndentationText()).to.equal(IndentationText.EightSpaces);
        });

        it("should add the files from tsconfig.json by default with the target in the tsconfig.json", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            const project = new Project({ tsConfigFilePath: "tsconfig.json" }, fs);
            expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(["/test/file.ts", "/test/test2/file2.ts"].sort());
            expect(project.getSourceFiles().map(s => s.getLanguageVersion())).to.deep.equal([ScriptTarget.ES5, ScriptTarget.ES5]);
        });

        it("should add the files from tsconfig.json by default and also take into account the passed in compiler options", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES5" } }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            const project = new Project({ tsConfigFilePath: "tsconfig.json", compilerOptions: { rootDir: "/test/test2" } }, fs);
            expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(["/test/test2/file2.ts"].sort());
        });

        it("should not add the files from tsconfig.json when specifying not to", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            const project = new Project({ tsConfigFilePath: "tsconfig.json", addFilesFromTsConfig: false }, fs);
            expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal([]);
        });
    });

    describe(nameof<Project>(project => project.getCompilerOptions), () => {
        it(`should get the default compiler options when not providing anything and no tsconfig exists`, () => {
            const host = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project({}, host);
            expect(project.getCompilerOptions()).to.deep.equal({});
        });

        it(`should not get the compiler options from tsconfig.json when not providing anything and a tsconfig exists`, () => {
            const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
            const project = new Project({}, host);
            expect(project.getCompilerOptions()).to.deep.equal({});
        });

        it(`should get empty compiler options when providing an empty compiler options object`, () => {
            const host = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions: {} }, host);
            expect(project.getCompilerOptions()).to.deep.equal({});
        });

        function doTsConfigTest(addFilesFromTsConfig: boolean) {
            const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
            const project = new Project({
                tsConfigFilePath: "tsconfig.json",
                compilerOptions: {
                    target: 2,
                    allowJs: true
                },
                addFilesFromTsConfig // the behaviour changes based on this value so it's good to test both of these
            }, host);
            expect(project.getCompilerOptions()).to.deep.equal({ rootDir: "/test", target: 2, allowJs: true });
        }

        it(`should override the tsconfig options when specifying to add files from tsconfig`, () => {
            doTsConfigTest(true);
        });

        it(`should override the tsconfig options when specifying to not add files from tsconfig`, () => {
            doTsConfigTest(false);
        });
    });

    describe(nameof<Project>(project => project.addExistingDirectoryIfExists), () => {
        it("should throw if the directory doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            expect(project.addExistingDirectoryIfExists("someDir")).to.be.undefined;
        });

        it("should add the directory if it exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["someDir"]);
            const project = new Project(undefined, fileSystem);
            const dir = project.addExistingDirectoryIfExists("someDir");
            expect(dir).to.not.be.undefined;
        });

        it("should add a directory and all its descendant directories when specifying the recursive option", () => {
            const directories = ["/", "dir", "dir/child1", "dir/child2", "dir/child1/grandChild1"];
            const project = new Project({ useVirtualFileSystem: true });
            directories.forEach(d => project.getFileSystem().mkdirSync(d));
            expect(project.addExistingDirectoryIfExists("dir", { recursive: true })).to.equal(project.getDirectoryOrThrow("dir"));

            testHelpers.testDirectoryTree(project.getDirectoryOrThrow("dir"), {
                directory: project.getDirectoryOrThrow("dir"),
                children: [{
                    directory: project.getDirectoryOrThrow("dir/child1"),
                    children: [{ directory: project.getDirectoryOrThrow("dir/child1/grandChild1") }]
                }, {
                    directory: project.getDirectoryOrThrow("dir/child2")
                }]
            }, project.getDirectoryOrThrow("/"));
        });
    });

    describe(nameof<Project>(project => project.addExistingDirectory), () => {
        it("should throw if the directory doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            expect(() => {
                project.addExistingDirectory("someDir");
            }).to.throw(errors.DirectoryNotFoundError);
        });

        it("should add the directory if it exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["someDir"]);
            const project = new Project(undefined, fileSystem);
            const dir = project.addExistingDirectory("someDir");
            expect(dir).to.not.be.undefined;
        });

        it("should add a directory and all its descendant directories when specifying the recursive option", () => {
            const directories = ["/", "dir", "dir/child1", "dir/child2", "dir/child1/grandChild1"];
            const project = new Project({ useVirtualFileSystem: true });
            directories.forEach(d => project.getFileSystem().mkdirSync(d));
            expect(project.addExistingDirectory("dir", { recursive: true })).to.equal(project.getDirectoryOrThrow("dir"));

            testHelpers.testDirectoryTree(project.getDirectoryOrThrow("dir"), {
                directory: project.getDirectoryOrThrow("dir"),
                children: [{
                    directory: project.getDirectoryOrThrow("dir/child1"),
                    children: [{ directory: project.getDirectoryOrThrow("dir/child1/grandChild1") }]
                }, {
                    directory: project.getDirectoryOrThrow("dir/child2")
                }]
            }, project.getDirectoryOrThrow("/"));
        });
    });

    describe(nameof<Project>(project => project.createDirectory), () => {
        it("should create the directory when it doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            const createdDir = project.createDirectory("someDir");
            expect(createdDir).to.not.be.undefined;
            expect(project.getDirectoryOrThrow("someDir")).to.equal(createdDir);
        });

        it("should create the parent directory if it doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            project.createSourceFile("file.txt");
            const createdDir = project.createDirectory("someDir");
            expect(createdDir).to.not.be.undefined;
            expect(project.getDirectoryOrThrow("someDir")).to.equal(createdDir);
        });

        it("should not throw when a directory already exists at the specified path", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            const createdDir = project.createDirectory("someDir");
            expect(() => project.createDirectory("someDir")).to.not.throw();
            expect(project.createDirectory("someDir")).to.equal(createdDir);
        });

        it("should not throw when a directory already exists on the file system at the specified path", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["childDir"]);
            const project = new Project(undefined, fileSystem);
            expect(() => project.createDirectory("childDir")).to.not.throw();
        });
    });

    describe(nameof<Project>(project => project.getDirectory), () => {
        const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
        const project = new Project(undefined, fileSystem);
        project.createSourceFile("dir/file.ts");

        it("should get a directory if it exists", () => {
            expect(project.getDirectory("dir")).to.not.be.undefined;
        });

        it("should not get a directory that doesn't exist", () => {
            expect(project.getDirectory("otherDir")).to.be.undefined;
        });
    });

    describe(nameof<Project>(project => project.getDirectoryOrThrow), () => {
        const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
        const project = new Project(undefined, fileSystem);
        project.createSourceFile("dir/file.ts");

        it("should get a directory if it exists", () => {
            expect(project.getDirectoryOrThrow("dir")).to.not.be.undefined;
        });

        it("should throw when it doesn't exist", () => {
            expect(() => project.getDirectoryOrThrow("otherDir")).to.throw();
        });
    });

    describe(nameof<Project>(project => project.getRootDirectories), () => {
        function getProject() {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            project.createSourceFile("/dir/sub/file.ts");
            project.createSourceFile("/dir/sub/child/file.ts");
            project.createSourceFile("/dir/sub2/file2.ts");
            project.createSourceFile("/dir/sub2/child/file2.ts");
            project.createSourceFile("/dir/sub3/child/file2.ts");
            return project;
        }

        it("should get all the directories without a parent", () => {
            const project = getProject();
            expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal([
                project.getDirectoryOrThrow("/dir/sub"),
                project.getDirectoryOrThrow("/dir/sub2"),
                project.getDirectoryOrThrow("/dir/sub3/child")
            ].map(d => d.getPath()));
        });

        it("should add an ancestor dir when requesting it", () => {
            const project = getProject();
            project.getDirectoryOrThrow("/dir");
            expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal([
                project.getDirectoryOrThrow("/dir")
            ].map(d => d.getPath()));
        });

        it("should add the root directory when requesting it", () => {
            const project = getProject();
            expect(project.getDirectory("/otherDir")).to.be.undefined;
            project.getDirectoryOrThrow("/");
            expect(project.getRootDirectories().map(d => d.getPath())).to.deep.equal([
                project.getDirectoryOrThrow("/")
            ].map(d => d.getPath()));
        });
    });

    describe(nameof<Project>(project => project.getDirectories), () => {
        const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
        const project = new Project(undefined, fileSystem);
        project.createSourceFile("dir/child/file.ts");
        project.createSourceFile("dir2/child/file2.ts");
        project.createSourceFile("dir3/child/file2.ts");
        project.createSourceFile("dir/file.ts");
        project.createSourceFile("dir2/file2.ts");

        it("should get all the directories in the order based on the directory structure", () => {
            expect(project.getDirectories().map(d => d.getPath())).to.deep.equal([
                project.getDirectoryOrThrow("dir"),
                project.getDirectoryOrThrow("dir2"),
                project.getDirectoryOrThrow("dir3/child"),
                project.getDirectoryOrThrow("dir/child"),
                project.getDirectoryOrThrow("dir2/child")
            ].map(d => d.getPath()));
        });
    });

    describe(nameof<Project>(project => project.addSourceFilesFromTsConfig), () => {
        it("should throw if the tsconfig doesn't exist", () => {
            const fs = new VirtualFileSystemHost();
            const project = new Project({}, fs);
            expect(() => project.addSourceFilesFromTsConfig("tsconfig.json")).to.throw(errors.FileNotFoundError);
        });

        it("should add the files from tsconfig.json", () => {
            const fs = new VirtualFileSystemHost();
            // todo: why did I need a slash at the start of `/test/exclude`?
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" }, "exclude": ["/test/exclude"] }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            fs.writeFileSync("/test/exclude/file.ts", "");
            fs.mkdirSync("/test/emptyDir");
            const project = new Project({}, fs);
            expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal([].sort());
            expect(project.getDirectories().map(s => s.getPath()).sort()).to.deep.equal([].sort());
            const returnedFiles = project.addSourceFilesFromTsConfig("tsconfig.json");
            const expectedFiles = ["/test/file.ts", "/test/test2/file2.ts"].sort();
            const expectedDirs = ["/test", "/test/test2", "/test/emptyDir"].sort();
            expect(project.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(expectedFiles);
            expect(returnedFiles.map(s => s.getFilePath()).sort()).to.deep.equal(expectedFiles);
            expect(project.getDirectories().map(s => s.getPath()).sort()).to.deep.equal(expectedDirs);
            // uses the compiler options of the project
            expect(project.getSourceFiles().map(s => s.getLanguageVersion())).to.deep.equal([ScriptTarget.Latest, ScriptTarget.Latest]);
        });
    });

    describe(nameof<Project>(project => project.addExistingSourceFile), () => {
        it("should throw an exception if adding a source file at a non-existent path", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            expect(() => {
                project.addExistingSourceFile("non-existent-file.ts");
            }).to.throw(errors.FileNotFoundError, `File not found: /non-existent-file.ts`);
        });

        it("should add a source file that exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
            const project = new Project(undefined, fileSystem);
            const sourceFile = project.addExistingSourceFile("file.ts");
            expect(sourceFile).to.not.be.undefined;
            expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.Latest);
        });
    });

    describe(nameof<Project>(project => project.addExistingSourceFileIfExists), () => {
        it("should return undefined if adding a source file at a non-existent path", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(project.addExistingSourceFileIfExists("non-existent-file.ts")).to.be.undefined;
        });

        it("should add a source file that exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
            const project = new Project(undefined, fileSystem);
            const sourceFile = project.addExistingSourceFileIfExists("file.ts");
            expect(sourceFile).to.not.be.undefined;
            expect(sourceFile!.getLanguageVersion()).to.equal(ScriptTarget.Latest);
        });
    });

    describe(nameof<Project>(project => project.addExistingSourceFiles), () => {
        it("should add based on a string file glob", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const fs = project.getFileSystem();
            fs.writeFileSync("file1.ts", "");
            fs.writeFileSync("dir/file.ts", "");
            fs.writeFileSync("dir/subDir/file.ts", "");
            const result = project.addExistingSourceFiles("/dir/**/*.ts");
            const sourceFiles = project.getSourceFiles();
            expect(sourceFiles.length).to.equal(2);
            expect(result).to.deep.equal(sourceFiles);
            expect(sourceFiles[0].getFilePath()).to.equal("/dir/file.ts");
            expect(sourceFiles[0].getLanguageVersion()).to.equal(ScriptTarget.Latest);
            expect(sourceFiles[0].isSaved()).to.be.true; // should be saved because it was read from the disk
            expect(sourceFiles[1].getFilePath()).to.equal("/dir/subDir/file.ts");
        });

        it("should add based on multiple file globs", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const fs = project.getFileSystem();
            fs.writeFileSync("file1.ts", "");
            fs.writeFileSync("dir/file.ts", "");
            fs.writeFileSync("dir/file.d.ts", "");
            fs.writeFileSync("dir/subDir/file.ts", "");
            const result = project.addExistingSourceFiles(["/dir/**/*.ts", "!/dir/**/*.d.ts"]);
            const sourceFiles = project.getSourceFiles();
            expect(sourceFiles.length).to.equal(2);
            expect(result).to.deep.equal(sourceFiles);
            expect(sourceFiles[0].getFilePath()).to.equal("/dir/file.ts");
            expect(sourceFiles[0].getLanguageVersion()).to.equal(ScriptTarget.Latest);
            expect(sourceFiles[1].getFilePath()).to.equal("/dir/subDir/file.ts");
        });

        it("should add the directory's descendant directories specified in the glob and ignore negated globs", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const fs = project.getFileSystem();
            ["/dir", "/dir2", "/dir/child", "/dir/child/grandChild", "/dir3"].forEach(d => fs.mkdir(d));
            const result = project.addExistingSourceFiles(["/dir/**/*.ts", "!/dir2", "/dir3/**/*.ts"]);
            testHelpers.testDirectoryTree(project.getDirectoryOrThrow("/dir"), {
                directory: project.getDirectoryOrThrow("/dir"),
                children: [{
                    directory: project.getDirectoryOrThrow("/dir/child"),
                    children: [{
                        directory: project.getDirectoryOrThrow("/dir/child/grandChild")
                    }]
                }]
            });
            testHelpers.testDirectoryTree(project.getDirectoryOrThrow("/dir3"), {
                directory: project.getDirectoryOrThrow("/dir3")
            });
        });
    });

    describe(nameof<Project>(project => project.createSourceFile), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("file.ts", "");
            expect(() => {
                project.createSourceFile("file.ts", "");
            }).to.throw(errors.InvalidOperationError, `A source file already exists at the provided file path: /file.ts`);
        });

        it("should not throw an exception if creating a source file at an existing path when providing the overwrite option", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const file1 = project.createSourceFile("file.ts", "");
            const newFileText = "class Identifier {}";
            const file2 = project.createSourceFile("file.ts", newFileText, { overwrite: true });
            expect(file1.getFullText()).to.equal(newFileText);
            expect(file2.getFullText()).to.equal(newFileText);
            expect(file1).to.equal(file2);
        });

        it("should throw an exception if creating a source file at an existing path on the disk", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
            const project = new Project(undefined, fileSystem);
            expect(() => project.createSourceFile("file.ts", "")).to.throw(errors.InvalidOperationError);
        });

        it("should mark the source file as having not been saved", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(project.createSourceFile("file.ts", "").isSaved()).to.be.false;
        });

        it("should create a source file with the default target", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(project.createSourceFile("file.ts", "").getLanguageVersion()).to.equal(ScriptTarget.Latest);
        });

        it("should create a source file with the compiler options' target", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.compilerOptions.set({ target: ScriptTarget.ES2015 });
            expect(project.createSourceFile("file.ts", "").getLanguageVersion()).to.equal(ScriptTarget.ES2015);
        });

        it("should add a source file based on a structure", () => {
            // basic test
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("MyFile.ts", {
                enums: [{
                    name: "MyEnum"
                }],
                imports: [{ moduleSpecifier: "./test" }],
                exports: [{ moduleSpecifier: "./test" }],
                bodyText: writer => writer.write("print('test');")
            });
            expect(sourceFile.getFullText()).to.equal(`import "./test";\n\nenum MyEnum {\n}\n\nprint('test');\n\nexport * from "./test";\n`);
        });

        it("should add for everything in the structure", () => {
            const structure: MakeRequired<SourceFileStructure> = {
                imports: [{ moduleSpecifier: "./test" }],
                exports: [{ moduleSpecifier: "./test2" }],
                classes: [{ name: "C" }],
                interfaces: [{ name: "I" }],
                typeAliases: [{ name: "T", type: "string" }],
                enums: [{ name: "E" }],
                functions: [{ name: "F" }],
                namespaces: [{ name: "N" }],
                bodyText: "console.log('here');"
            };
            const sourceFile = new Project({ useVirtualFileSystem: true }).createSourceFile("MyFile.ts", structure);
            const expectedText = `import "./test";\n\n` +
                "type T = string;\n\ninterface I {\n}\n\nenum E {\n}\n\n" +
                "function F() {\n}\n\nclass C {\n}\n\nnamespace N {\n}\n\n" +
                "console.log('here');\n\n" +
                `export * from "./test2";\n`;
            expect(sourceFile.getFullText()).to.equal(expectedText);
        });

        it("", () => {
            // todo: remove
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("MyFile.ts", "enum MyEnum {\n    myMember\n}\nlet myEnum: MyEnum;\nlet myOtherEnum: MyNewEnum;");
            const enumDef = sourceFile.getEnums()[0];
            enumDef.rename("NewName");
            const addedEnum = sourceFile.addEnum({
                name: "MyNewEnum"
            });
            addedEnum.rename("MyOtherNewName");
            const enumMember = enumDef.getMembers()[0];
            enumMember.rename("myNewMemberName");
            expect(enumMember.getValue()).to.equal(0);
            expect(sourceFile.getFullText()).to.equal("enum NewName {\n    myNewMemberName\n}\nlet myEnum: NewName;\nlet myOtherEnum: MyOtherNewName;\n\nenum MyOtherNewName {\n}\n");
        });
    });

    describe("mixing real files with virtual files", () => {
        const testFilesDirPath = path.join(__dirname, "../../src/tests/testFiles");
        const project = new Project();
        project.addExistingSourceFiles(`${testFilesDirPath}/**/*.ts`);
        project.createSourceFile(
            path.join(testFilesDirPath, "variableTestFile.ts"),
            `import * as testClasses from "./testClasses";\n\nlet myVar = new testClasses.TestClass().name;\n`
        );

        it("should have 4 source files", () => {
            expect(project.getSourceFiles().length).to.equal(4);
        });

        it("should rename a name appropriately", () => {
            const interfaceFile = project.getSourceFileOrThrow("testInterfaces.ts");
            interfaceFile.getInterfaces()[0].getProperties()[0].rename("newName");
            const variableFile = project.getSourceFileOrThrow("variableTestFile.ts");
            expect(variableFile.getFullText()).to.equal(`import * as testClasses from "./testClasses";\n\nlet myVar = new testClasses.TestClass().newName;\n`);
        });
    });

    describe(nameof<Project>(project => project.removeSourceFile), () => {
        it("should remove the source file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("myFile.ts", ``);
            expect(project.removeSourceFile(sourceFile)).to.equal(true);
            expect(project.removeSourceFile(sourceFile)).to.equal(false);
            expect(project.getSourceFiles().length).to.equal(0);
            expect(() => sourceFile.getChildCount()).to.throw(); // should be forgotten
        });
    });

    describe(nameof<Project>(project => project.save), () => {
        it("should save all the unsaved source files asynchronously", async () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            project.createSourceFile("file1.ts", "").saveSync();
            project.createSourceFile("file2.ts", "");
            project.createSourceFile("file3.ts", "");
            await project.save();
            expect(project.getSourceFiles().map(f => f.isSaved())).to.deep.equal([true, true, true]);
            expect(fileSystem.getWriteLog().length).to.equal(3);
        });

        it("should delete any deleted source files & directories and save unsaved source files", async () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            const sourceFileToDelete = project.createDirectory("dir").createSourceFile("file.ts");
            sourceFileToDelete.saveSync();
            sourceFileToDelete.delete();
            const dirToDelete = project.createDirectory("dir2");
            dirToDelete.createSourceFile("file.ts");
            dirToDelete.saveSync();
            dirToDelete.delete();
            let sourceFileToUndelete = project.createSourceFile("file.ts");
            sourceFileToUndelete.saveSync();
            sourceFileToUndelete.delete();
            sourceFileToUndelete = project.createSourceFile("file.ts");

            await project.save();
            expect(fileSystem.getFiles().map(f => f[0])).to.deep.equal(["/file.ts"]);
            expect(fileSystem.getCreatedDirectories().sort()).to.deep.equal(["/dir"].sort());
        });
    });

    describe(nameof<Project>(project => project.saveSync), () => {
        it("should save all the unsaved source files synchronously", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project(undefined, fileSystem);
            project.createSourceFile("file1.ts", "").saveSync();
            project.createSourceFile("file2.ts", "");
            project.createSourceFile("file3.ts", "");
            project.saveSync();

            expect(project.getSourceFiles().map(f => f.isSaved())).to.deep.equal([true, true, true]);
            expect(fileSystem.getWriteLog().length).to.equal(3);
        });
    });

    describe(nameof<Project>(project => project.emit), () => {
        function setup(compilerOptions: CompilerOptions) {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const project = new Project({ compilerOptions }, fileSystem);
            project.createSourceFile("file1.ts", "const num1 = 1;");
            project.createSourceFile("file2.ts", "const num2 = 2;");
            return {fileSystem, project};
        }

        it("should emit multiple files when not specifying any options", () => {
            const {project, fileSystem} = setup({ noLib: true, outDir: "dist" });
            const result = project.emit();
            expect(result).to.be.instanceof(EmitResult);

            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog[1].filePath).to.equal("/dist/file2.js");
            expect(writeLog[1].fileText).to.equal("var num2 = 2;\n");
            expect(writeLog.length).to.equal(2);
        });

        it("should emit the source file when specified", () => {
            const {project, fileSystem} = setup({ noLib: true, outDir: "dist" });
            project.emit({ targetSourceFile: project.getSourceFile("file1.ts") });

            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog.length).to.equal(1);
        });

        it("should only emit the declaration file when specified", () => {
            const {project, fileSystem} = setup({ noLib: true, outDir: "dist", declaration: true });
            project.emit({ emitOnlyDtsFiles: true });

            const writeLog = fileSystem.getWriteLog();
            expect(writeLog[0].filePath).to.equal("/dist/file1.d.ts");
            expect(writeLog[0].fileText).to.equal("declare const num1 = 1;\n");
            expect(writeLog[1].filePath).to.equal("/dist/file2.d.ts");
            expect(writeLog[1].fileText).to.equal("declare const num2 = 2;\n");
            expect(writeLog.length).to.equal(2);
        });
    });

    describe(nameof<Project>(project => project.getSourceFile), () => {
        it("should get the first match based on the directory structure", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("dir/file.ts");
            const expectedFile = project.createSourceFile("file.ts");
            expect(project.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on the directory structure when specifying a dot slash", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("dir/file.ts");
            const expectedFile = project.createSourceFile("file.ts");
            expect(project.getSourceFile("./file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on the directory structure when using ../", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const expectedFile = project.createSourceFile("dir/file.ts");
            project.createSourceFile("file.ts");
            expect(project.getSourceFile("dir/../dir/file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on a file name", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("file.ts");
            const expectedFile = project.createSourceFile("dir/file2.ts");
            expect(project.getSourceFile("file2.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get when specifying an absolute path", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("dir/file.ts");
            const expectedFile = project.createSourceFile("file.ts");
            expect(project.getSourceFile("/file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on the directory structure when swapping the order of what was created first", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const expectedFile = project.createSourceFile("file.ts");
            project.createSourceFile("dir/file.ts");
            expect(project.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });
    });

    describe(nameof<Project>(project => project.getSourceFileOrThrow), () => {
        it("should throw when it can't find the source file based on a provided path", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(() => project.getSourceFileOrThrow("some path")).to.throw();
        });

        it("should throw when it can't find the source file based on a provided condition", () => {
            const project = new Project({ useVirtualFileSystem: true });
            expect(() => project.getSourceFileOrThrow(s => false)).to.throw();
        });

        it("should not throw when it finds the file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("myFile.ts", "");
            expect(project.getSourceFileOrThrow("myFile.ts").getFilePath()).to.contain("myFile.ts");
        });
    });

    describe(nameof<Project>(project => project.getSourceFiles), () => {
        it("should get all the source files added to the ast sorted by directory structure", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("dir/child/file.ts");
            project.createSourceFile("dir/file.ts");
            project.createSourceFile("file1.ts");
            project.createSourceFile("File1.ts");
            project.createSourceFile("file2.ts");
            expect(project.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([
                "/File1.ts", // upercase first
                "/file1.ts",
                "/file2.ts",
                "/dir/file.ts",
                "/dir/child/file.ts"
            ]);
        });

        describe("globbing", () => {
            const project = new Project({ useVirtualFileSystem: true });
            project.createSourceFile("file.ts", "");
            project.createSourceFile("src/file.ts", "");
            project.createSourceFile("src/test/file1.ts", "");
            project.createSourceFile("src/test/file1.d.ts", "");
            project.createSourceFile("src/test/file2.ts", "");
            project.createSourceFile("src/test/file3.ts", "");
            project.createSourceFile("src/test/file3.js", "");
            project.createSourceFile("src/test/folder/file.ts", "");

            it("should be able to do a file glob", () => {
                expect(project.getSourceFiles("**/test/**/*.ts").map(s => s.getFilePath())).to.deep.equal([
                    "/src/test/file1.d.ts",
                    "/src/test/file1.ts",
                    "/src/test/file2.ts",
                    "/src/test/file3.ts",
                    "/src/test/folder/file.ts"
                ]);
            });

            it("should be able to do a file glob with a relative path", () => {
                expect(project.getSourceFiles("src/test/folder/*.ts").map(s => s.getFilePath())).to.deep.equal([
                    "/src/test/folder/file.ts"
                ]);
            });

            it("should be able to do a file glob with a relative path with a dot", () => {
                expect(project.getSourceFiles("./src/test/folder/*.ts").map(s => s.getFilePath())).to.deep.equal([
                    "/src/test/folder/file.ts"
                ]);
            });

            it("should be able to do a file glob with an absolute path", () => {
                expect(project.getSourceFiles("/src/test/folder/*.ts").map(s => s.getFilePath())).to.deep.equal([
                    "/src/test/folder/file.ts"
                ]);
            });

            it("should be able to do a file glob with multiple patterns", () => {
                expect(project.getSourceFiles(["**/src/**/*.ts", "!**/src/test/**/*.ts", "!**/*.d.ts"]).map(s => s.getFilePath())).to.deep.equal([
                    "/src/file.ts"
                ]);
            });
        });
    });

    describe(nameof<Project>(t => t.forgetNodesCreatedInBlock), () => {
        describe("synchronous", () => {
            const project = new Project({ useVirtualFileSystem: true });
            let sourceFile: SourceFile;
            let sourceFileNotNavigated: SourceFile;
            let classNode: Node;
            let namespaceNode: NamespaceDeclaration;
            let namespaceKeywordNode: Node;
            let interfaceNode1: Node;
            let interfaceNode2: Node;
            let interfaceNode3: Node;
            let interfaceNode4: Node;
            let interfaceNode5: Node;
            project.forgetNodesCreatedInBlock(remember => {
                sourceFile = project.createSourceFile("test.ts", "class MyClass {} namespace MyNamespace { interface Interface1 {} interface Interface2 {} " +
                    "interface Interface3 {} interface Interface4 {} }");
                sourceFileNotNavigated = project.createSourceFile("test2.ts", "class MyClass {}");
                classNode = sourceFile.getClassOrThrow("MyClass");
                namespaceNode = sourceFile.getNamespaceOrThrow("MyNamespace");

                project.forgetNodesCreatedInBlock(remember2 => {
                    interfaceNode2 = namespaceNode.getInterfaceOrThrow("Interface2");
                    interfaceNode3 = namespaceNode.getInterfaceOrThrow("Interface3");
                    interfaceNode4 = namespaceNode.getInterfaceOrThrow("Interface4");
                    interfaceNode5 = namespaceNode.addInterface({ name: "Interface5" });
                    remember2(interfaceNode3, interfaceNode4);
                });

                namespaceKeywordNode = namespaceNode.getFirstChildByKindOrThrow(SyntaxKind.NamespaceKeyword);
                interfaceNode1 = namespaceNode.getInterfaceOrThrow("Interface1");
                remember(interfaceNode1);
            });

            it("should not have forgotten the source file", () => {
                expect(sourceFile.wasForgotten()).to.be.false;
            });

            it("should not have forgotten the not navigated source file", () => {
                expect(sourceFileNotNavigated.wasForgotten()).to.be.false;
            });

            it("should have forgotten the class", () => {
                expect(classNode.wasForgotten()).to.be.true;
            });

            it("should not have forgotten the namespace because one of its children was remembered", () => {
                expect(namespaceNode.wasForgotten()).to.be.false;
            });

            it("should have forgotten the namespace keyword", () => {
                expect(namespaceKeywordNode.wasForgotten()).to.be.true;
            });

            it("should not have forgotten the first interface because it was remembered", () => {
                expect(interfaceNode1.wasForgotten()).to.be.false;
            });

            it("should have forgotten the second interface", () => {
                expect(interfaceNode2.wasForgotten()).to.be.true;
            });

            it("should not have forgotten the third interface because it was remembered", () => {
                expect(interfaceNode3.wasForgotten()).to.be.false;
            });

            it("should not have forgotten the fourth interface because it was remembered", () => {
                expect(interfaceNode4.wasForgotten()).to.be.false;
            });

            it("should have forgotten the created fifth interface because it was not remembered", () => {
                expect(interfaceNode5.wasForgotten()).to.be.true;
            });

            it("should not throw if removing a created node in a block", () => {
                const newSourceFile = project.createSourceFile("file3.ts", "class MyClass {}");
                project.forgetNodesCreatedInBlock(remember => {
                    const classDec = newSourceFile.getClassOrThrow("MyClass");
                    classDec.remove();
                });
            });

            it("should throw if attempting to remember a node that was forgotten", () => {
                const newSourceFile = project.createSourceFile("file4.ts");
                project.forgetNodesCreatedInBlock(remember => {
                    const classDec = newSourceFile.addClass({ name: "Class" });
                    classDec.forget();
                    expect(() => remember(classDec)).to.throw(errors.InvalidOperationError);
                });
            });

            it("should get exceptions thrown in the body", () => {
                expect(() => project.forgetNodesCreatedInBlock(() => { throw new Error(""); })).to.throw();
            });
        });

        describe("asynchronous", async () => {
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("file.ts");
            let interfaceDec: InterfaceDeclaration;
            let classDec: ClassDeclaration;
            await project.forgetNodesCreatedInBlock(async remember => {
                // do something to cause this code to be added to the end of the execution queue
                await new Promise((resolve, reject) => resolve());

                classDec = sourceFile.addClass({ name: "Class" });
                interfaceDec = sourceFile.addInterface({ name: "Interface" });
                remember(interfaceDec);
            });

            it("should have forgotten the class", () => {
                expect(classDec.wasForgotten()).to.be.true;
            });

            it("should have not forgotten the interface", () => {
                expect(interfaceDec.wasForgotten()).to.be.false;
            });
        });
    });

    describe(nameof<Project>(p => p.compilerOptions), () => {
        it("should reparse after modifying the compiler options", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("myFile.ts", `function myFunction(param: string) {}`);
            expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.Latest);
            project.compilerOptions.set({ target: ScriptTarget.ES5 });
            expect(sourceFile.getLanguageVersion()).to.equal(ScriptTarget.ES5);
        });
    });

    describe("manipulating then getting something from the type checker", () => {
        it("should not error after manipulation", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const sourceFile = project.createSourceFile("myFile.ts", `function myFunction(param: string) {}`);
            const param = sourceFile.getFunctions()[0].getParameters()[0];
            expect(param.getType().getText()).to.equal("string");
            param.setType("number");
            expect(param.getType().getText()).to.equal("number");
        });
    });
});
