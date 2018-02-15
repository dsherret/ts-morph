import * as path from "path";
import {expect} from "chai";
import {ts, SyntaxKind, CompilerOptions} from "./../typescript";
import {EmitResult, Node, SourceFile, NamespaceDeclaration, InterfaceDeclaration, ClassDeclaration} from "./../compiler";
import {VirtualFileSystemHost} from "./../fileSystem";
import {TsSimpleAst} from "./../TsSimpleAst";
import {IndentationText} from "./../ManipulationSettings";
import {FileUtils} from "./../utils";
import * as errors from "./../errors";
import * as testHelpers from "./testHelpers";

console.log("");
console.log("TypeScript version: " + ts.version);

describe(nameof(TsSimpleAst), () => {
    describe("constructor", () => {
        it("should set the manipulation settings if provided", () => {
            const ast = new TsSimpleAst({
                manipulationSettings: {
                    indentationText: IndentationText.EightSpaces
                }
            });

            expect(ast.manipulationSettings.getIndentationText()).to.equal(IndentationText.EightSpaces);
        });

        it("should add the files from tsconfig.json by default", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            const ast = new TsSimpleAst({ tsConfigFilePath: "tsconfig.json" }, fs);
            expect(ast.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(["/test/file.ts", "/test/test2/file2.ts"].sort());
        });

        it("should add the files from tsconfig.json by default and also take into account the passed in compiler options", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "target": "ES5" } }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            const ast = new TsSimpleAst({ tsConfigFilePath: "tsconfig.json", compilerOptions: { rootDir: "/test/test2" } }, fs);
            expect(ast.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(["/test/test2/file2.ts"].sort());
        });

        it("should not add the files from tsconfig.json when specifying not to", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            const ast = new TsSimpleAst({ tsConfigFilePath: "tsconfig.json", addFilesFromTsConfig: false }, fs);
            expect(ast.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal([]);
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getCompilerOptions), () => {
        it(`should get the default compiler options when not providing anything and no tsconfig exists`, () => {
            const host = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst({}, host);
            expect(ast.getCompilerOptions()).to.deep.equal({});
        });

        it(`should not get the compiler options from tsconfig.json when not providing anything and a tsconfig exists`, () => {
            const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
            const ast = new TsSimpleAst({}, host);
            expect(ast.getCompilerOptions()).to.deep.equal({});
        });

        it(`should get empty compiler options when providing an empty compiler options object`, () => {
            const host = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst({ compilerOptions: {} }, host);
            expect(ast.getCompilerOptions()).to.deep.equal({});
        });

        function doTsConfigTest(addFilesFromTsConfig: boolean) {
            const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
            const ast = new TsSimpleAst({
                tsConfigFilePath: "tsconfig.json",
                compilerOptions: {
                    target: 2,
                    allowJs: true
                },
                addFilesFromTsConfig // the behaviour changes based on this value so it's good to test both of these
            }, host);
            expect(ast.getCompilerOptions()).to.deep.equal({ rootDir: "/test", target: 2, allowJs: true });
        }

        it(`should override the tsconfig options when specifying to add files from tsconfig`, () => {
            doTsConfigTest(true);
        });

        it(`should override the tsconfig options when specifying to not add files from tsconfig`, () => {
            doTsConfigTest(false);
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addDirectoryIfExists), () => {
        it("should throw if the directory doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            expect(ast.addDirectoryIfExists("someDir")).to.be.undefined;
        });

        it("should add the directory if it exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["someDir"]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const dir = ast.addDirectoryIfExists("someDir");
            expect(dir).to.not.be.undefined;
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addExistingDirectory), () => {
        it("should throw if the directory doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            expect(() => {
                ast.addExistingDirectory("someDir");
            }).to.throw(errors.DirectoryNotFoundError);
        });

        it("should add the directory if it exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["someDir"]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const dir = ast.addExistingDirectory("someDir");
            expect(dir).to.not.be.undefined;
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.createDirectory), () => {
        it("should create the directory when it doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const createdDir = ast.createDirectory("someDir");
            expect(createdDir).to.not.be.undefined;
            expect(ast.getDirectoryOrThrow("someDir")).to.equal(createdDir);
        });

        it("should create the parent directory if it doesn't exist", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            ast.createSourceFile("file.txt");
            const createdDir = ast.createDirectory("someDir");
            expect(createdDir).to.not.be.undefined;
            expect(ast.getDirectoryOrThrow("someDir")).to.equal(createdDir);
        });

        it("should throw when a directory already exists at the specified path", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const createdDir = ast.createDirectory("someDir");
            expect(() => ast.createDirectory("someDir")).to.throw(errors.InvalidOperationError);
        });

        it("should throw when a directory already exists on the file system at the specified path", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([], ["childDir"]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            expect(() => ast.createDirectory("childDir")).to.throw(errors.InvalidOperationError);
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getDirectory), () => {
        const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
        const ast = new TsSimpleAst(undefined, fileSystem);
        ast.createSourceFile("dir/file.ts");

        it("should get a directory if it exists", () => {
            expect(ast.getDirectory("dir")).to.not.be.undefined;
        });

        it("should not get a directory that doesn't exist", () => {
            expect(ast.getDirectory("otherDir")).to.be.undefined;
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getDirectoryOrThrow), () => {
        const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
        const ast = new TsSimpleAst(undefined, fileSystem);
        ast.createSourceFile("dir/file.ts");

        it("should get a directory if it exists", () => {
            expect(ast.getDirectoryOrThrow("dir")).to.not.be.undefined;
        });

        it("should throw when it doesn't exist", () => {
            expect(() => ast.getDirectoryOrThrow("otherDir")).to.throw();
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getRootDirectories), () => {
        const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
        const ast = new TsSimpleAst(undefined, fileSystem);
        ast.createSourceFile("dir/file.ts");
        ast.createSourceFile("dir/child/file.ts");
        ast.createSourceFile("dir2/file2.ts");
        ast.createSourceFile("dir2/child/file2.ts");
        ast.createSourceFile("dir3/child/file2.ts");

        it("should get all the directories without a parent", () => {
            expect(ast.getRootDirectories().map(d => d.getPath())).to.deep.equal([
                ast.getDirectoryOrThrow("dir"),
                ast.getDirectoryOrThrow("dir2"),
                ast.getDirectoryOrThrow("dir3/child")
            ].map(d => d.getPath()));
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getDirectories), () => {
        const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
        const ast = new TsSimpleAst(undefined, fileSystem);
        ast.createSourceFile("dir/child/file.ts");
        ast.createSourceFile("dir2/child/file2.ts");
        ast.createSourceFile("dir3/child/file2.ts");
        ast.createSourceFile("dir/file.ts");
        ast.createSourceFile("dir2/file2.ts");

        it("should get all the directories in the order based on the directory structure", () => {
            expect(ast.getDirectories().map(d => d.getPath())).to.deep.equal([
                ast.getDirectoryOrThrow("dir"),
                ast.getDirectoryOrThrow("dir2"),
                ast.getDirectoryOrThrow("dir3/child"),
                ast.getDirectoryOrThrow("dir/child"),
                ast.getDirectoryOrThrow("dir2/child")
            ].map(d => d.getPath()));
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addSourceFilesFromTsConfig), () => {
        it("should throw if the tsconfig doesn't exist", () => {
            const fs = new VirtualFileSystemHost();
            const ast = new TsSimpleAst({}, fs);
            expect(() => ast.addSourceFilesFromTsConfig("tsconfig.json")).to.throw(errors.FileNotFoundError);
        });

        it("should add the files from tsconfig.json", () => {
            const fs = new VirtualFileSystemHost();
            fs.writeFileSync("tsconfig.json", `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }`);
            fs.writeFileSync("/otherFile.ts", "");
            fs.writeFileSync("/test/file.ts", "");
            fs.writeFileSync("/test/test2/file2.ts", "");
            const ast = new TsSimpleAst({}, fs);
            expect(ast.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal([].sort());
            const returnedFiles = ast.addSourceFilesFromTsConfig("tsconfig.json");
            const expectedFiles = ["/test/file.ts", "/test/test2/file2.ts"].sort();
            expect(ast.getSourceFiles().map(s => s.getFilePath()).sort()).to.deep.equal(expectedFiles);
            expect(returnedFiles.map(s => s.getFilePath()).sort()).to.deep.equal(expectedFiles);
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addExistingSourceFile), () => {
        it("should throw an exception if adding a source file at a non-existent path", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            expect(() => {
                ast.addExistingSourceFile("non-existent-file.ts");
            }).to.throw(errors.FileNotFoundError, `File not found: /non-existent-file.ts`);
        });

        it("should add a source file that exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const sourceFile = ast.addExistingSourceFile("file.ts");
            expect(sourceFile).to.not.be.undefined;
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addSourceFileIfExists), () => {
        it("should return undefined if adding a source file at a non-existent path", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            expect(ast.addSourceFileIfExists("non-existent-file.ts")).to.be.undefined;
        });

        it("should add a source file that exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const sourceFile = ast.addSourceFileIfExists("file.ts");
            expect(sourceFile).to.not.be.undefined;
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addExistingSourceFiles), () => {
        it("should add based on a string file glob", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const fs = ast.getFileSystem();
            fs.writeFileSync("file1.ts", "");
            fs.writeFileSync("dir/file.ts", "");
            fs.writeFileSync("dir/subDir/file.ts", "");
            const result = ast.addExistingSourceFiles("/dir/**/*.ts");
            const sourceFiles = ast.getSourceFiles();
            expect(sourceFiles.length).to.equal(2);
            expect(result).to.deep.equal(sourceFiles);
            expect(sourceFiles[0].getFilePath()).to.equal("/dir/file.ts");
            expect(sourceFiles[0].isSaved()).to.be.true; // should be saved because it was read from the disk
            expect(sourceFiles[1].getFilePath()).to.equal("/dir/subDir/file.ts");
        });

        it("should add based on multiple file globs", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const fs = ast.getFileSystem();
            fs.writeFileSync("file1.ts", "");
            fs.writeFileSync("dir/file.ts", "");
            fs.writeFileSync("dir/file.d.ts", "");
            fs.writeFileSync("dir/subDir/file.ts", "");
            const result = ast.addExistingSourceFiles(["/dir/**/*.ts", "!/dir/**/*.d.ts"]);
            const sourceFiles = ast.getSourceFiles();
            expect(sourceFiles.length).to.equal(2);
            expect(result).to.deep.equal(sourceFiles);
            expect(sourceFiles[0].getFilePath()).to.equal("/dir/file.ts");
            expect(sourceFiles[1].getFilePath()).to.equal("/dir/subDir/file.ts");
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.createSourceFile), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            ast.createSourceFile("file.ts", "");
            expect(() => {
                ast.createSourceFile("file.ts", "");
            }).to.throw(errors.InvalidOperationError, `A source file already exists at the provided file path: /file.ts`);
        });

        it("should throw an exception if creating a source file at an existing path on the disk", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            expect(() => ast.createSourceFile("file.ts", "")).to.throw(errors.InvalidOperationError);
        });

        it("should mark the source file as having not been saved", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const sourceFile = ast.createSourceFile("file.ts", "");
            expect(sourceFile.isSaved()).to.be.false;
        });

        it("", () => {
            // todo: remove
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const sourceFile = ast.createSourceFile("MyFile.ts", "enum MyEnum {\n    myMember\n}\nlet myEnum: MyEnum;\nlet myOtherEnum: MyNewEnum;");
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

    describe(nameof<TsSimpleAst>(ast => ast.createSourceFile), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            ast.createSourceFile("file.ts", "");
            expect(() => {
                ast.createSourceFile("file.ts", {});
            }).to.throw(errors.InvalidOperationError, `A source file already exists at the provided file path: /file.ts`);
        });

        it("should mark the source file as having not been saved", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const sourceFile = ast.createSourceFile("file.ts", {});
            expect(sourceFile.isSaved()).to.be.false;
        });

        it("should add a source file based on a structure", () => {
            // basic test
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const sourceFile = ast.createSourceFile("MyFile.ts", {
                enums: [{
                    name: "MyEnum"
                }],
                imports: [{ moduleSpecifier: "./test" }],
                exports: [{ moduleSpecifier: "./test" }]
            });
            expect(sourceFile.getFullText()).to.equal(`import "./test";\n\nenum MyEnum {\n}\n\nexport * from "./test";\n`);
        });
    });

    describe("mixing real files with virtual files", () => {
        const testFilesDirPath = path.join(__dirname, "../../src/tests/testFiles");
        const ast = new TsSimpleAst();
        ast.addExistingSourceFiles(`${testFilesDirPath}/**/*.ts`);
        ast.createSourceFile(
            path.join(testFilesDirPath, "variableTestFile.ts"),
            `import * as testClasses from "./testClasses";\n\nlet var = new testClasses.TestClass().name;\n`
        );

        it("should have 4 source files", () => {
            expect(ast.getSourceFiles().length).to.equal(4);
        });

        it("should rename a name appropriately", () => {
            const interfaceFile = ast.getSourceFileOrThrow("testInterfaces.ts");
            interfaceFile.getInterfaces()[0].getProperties()[0].rename("newName");
            const variableFile = ast.getSourceFileOrThrow("variableTestFile.ts");
            expect(variableFile.getFullText()).to.equal(`import * as testClasses from "./testClasses";\n\nlet var = new testClasses.TestClass().newName;\n`);
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.removeSourceFile), () => {
        it("should remove the source file", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const sourceFile = ast.createSourceFile("myFile.ts", ``);
            expect(ast.removeSourceFile(sourceFile)).to.equal(true);
            expect(ast.removeSourceFile(sourceFile)).to.equal(false);
            expect(ast.getSourceFiles().length).to.equal(0);
            expect(() => sourceFile.getChildCount()).to.throw(); // should be forgotten
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.saveUnsavedSourceFiles), () => {
        it("should save all the unsaved source files asynchronously", async () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            ast.createSourceFile("file1.ts", "").saveSync();
            ast.createSourceFile("file2.ts", "");
            ast.createSourceFile("file3.ts", "");
            await ast.saveUnsavedSourceFiles();
            expect(ast.getSourceFiles().map(f => f.isSaved())).to.deep.equal([true, true, true]);
            expect(fileSystem.getWriteLog().length).to.equal(2); // 2 writes
            expect(fileSystem.getSyncWriteLog().length).to.equal(1); // 1 write
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.saveUnsavedSourceFilesSync), () => {
        it("should save all the unsaved source files synchronously", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            ast.createSourceFile("file1.ts", "").saveSync();
            ast.createSourceFile("file2.ts", "");
            ast.createSourceFile("file3.ts", "");
            ast.saveUnsavedSourceFilesSync();

            expect(ast.getSourceFiles().map(f => f.isSaved())).to.deep.equal([true, true, true]);
            expect(fileSystem.getWriteLog().length).to.equal(0);
            expect(fileSystem.getSyncWriteLog().length).to.equal(3); // 3 writes
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.emit), () => {
        function setup(compilerOptions: CompilerOptions) {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst({ compilerOptions }, fileSystem);
            ast.createSourceFile("file1.ts", "const num1 = 1;");
            ast.createSourceFile("file2.ts", "const num2 = 2;");
            return {fileSystem, ast};
        }

        it("should emit multiple files when not specifying any options", () => {
            const {ast, fileSystem} = setup({ noLib: true, outDir: "dist" });
            const result = ast.emit();
            expect(result).to.be.instanceof(EmitResult);

            const writeLog = fileSystem.getSyncWriteLog();
            expect(writeLog[0].filePath).to.equal("dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog[1].filePath).to.equal("dist/file2.js");
            expect(writeLog[1].fileText).to.equal("var num2 = 2;\n");
            expect(writeLog.length).to.equal(2);
        });

        it("should emit the source file when specified", () => {
            const {ast, fileSystem} = setup({ noLib: true, outDir: "dist" });
            ast.emit({ targetSourceFile: ast.getSourceFile("file1.ts") });

            const writeLog = fileSystem.getSyncWriteLog();
            expect(writeLog[0].filePath).to.equal("dist/file1.js");
            expect(writeLog[0].fileText).to.equal("var num1 = 1;\n");
            expect(writeLog.length).to.equal(1);
        });

        it("should only emit the declaration file when specified", () => {
            const {ast, fileSystem} = setup({ noLib: true, outDir: "dist", declaration: true });
            ast.emit({ emitOnlyDtsFiles: true });

            const writeLog = fileSystem.getSyncWriteLog();
            expect(writeLog[0].filePath).to.equal("dist/file1.d.ts");
            expect(writeLog[0].fileText).to.equal("declare const num1 = 1;\n");
            expect(writeLog[1].filePath).to.equal("dist/file2.d.ts");
            expect(writeLog[1].fileText).to.equal("declare const num2 = 2;\n");
            expect(writeLog.length).to.equal(2);
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getSourceFile), () => {
        it("should get the first match based on the directory structure", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            ast.createSourceFile("dir/file.ts");
            const expectedFile = ast.createSourceFile("file.ts");
            expect(ast.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on the directory structure when swapping the order fo what was created first", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const expectedFile = ast.createSourceFile("file.ts");
            ast.createSourceFile("dir/file.ts");
            expect(ast.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getSourceFileOrThrow), () => {
        it("should throw when it can't find the source file based on a provided path", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            expect(() => ast.getSourceFileOrThrow("some path")).to.throw();
        });

        it("should throw when it can't find the source file based on a provided condition", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            expect(() => ast.getSourceFileOrThrow(s => false)).to.throw();
        });

        it("should not throw when it finds the file", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            ast.createSourceFile("myFile.ts", "");
            expect(ast.getSourceFileOrThrow("myFile.ts").getFilePath()).to.contain("myFile.ts");
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getSourceFiles), () => {
        it("should get all the source files added to the ast sorted by directory structure", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            ast.createSourceFile("dir/child/file.ts");
            ast.createSourceFile("dir/file.ts");
            ast.createSourceFile("file1.ts");
            ast.createSourceFile("file2.ts");
            expect(ast.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([
                "/file1.ts",
                "/file2.ts",
                "/dir/file.ts",
                "/dir/child/file.ts"
            ]);
        });

        describe("globbing", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            ast.createSourceFile("file.ts", "");
            ast.createSourceFile("src/file.ts", "");
            ast.createSourceFile("src/test/file1.ts", "");
            ast.createSourceFile("src/test/file1.d.ts", "");
            ast.createSourceFile("src/test/file2.ts", "");
            ast.createSourceFile("src/test/file3.ts", "");
            ast.createSourceFile("src/test/file3.js", "");
            ast.createSourceFile("src/test/folder/file.ts", "");

            it("should be able to do a file glob", () => {
                expect(ast.getSourceFiles("**/src/test/**/*.ts").map(s => s.getFilePath())).to.deep.equal([
                    "/src/test/file1.d.ts",
                    "/src/test/file1.ts",
                    "/src/test/file2.ts",
                    "/src/test/file3.ts",
                    "/src/test/folder/file.ts"
                ]);
            });

            it("should be able to do a file glob with multiple patterns", () => {
                expect(ast.getSourceFiles(["**/src/**/*.ts", "!**/src/test/**/*.ts", "!**/*.d.ts"]).map(s => s.getFilePath())).to.deep.equal([
                    "/src/file.ts"
                ]);
            });
        });
    });

    describe(nameof<TsSimpleAst>(t => t.forgetNodesCreatedInBlock), () => {
        describe("synchronous", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
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
            ast.forgetNodesCreatedInBlock(remember => {
                sourceFile = ast.createSourceFile("test.ts", "class MyClass {} namespace MyNamespace { interface Interface1 {} interface Interface2 {} " +
                    "interface Interface3 {} interface Interface4 {} }");
                sourceFileNotNavigated = ast.createSourceFile("test2.ts", "class MyClass {}");
                classNode = sourceFile.getClassOrThrow("MyClass");
                namespaceNode = sourceFile.getNamespaceOrThrow("MyNamespace");

                ast.forgetNodesCreatedInBlock(remember2 => {
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
                const newSourceFile = ast.createSourceFile("file3.ts", "class MyClass {}");
                ast.forgetNodesCreatedInBlock(remember => {
                    const classDec = newSourceFile.getClassOrThrow("MyClass");
                    classDec.remove();
                });
            });

            it("should throw if attempting to remember a node that was forgotten", () => {
                const newSourceFile = ast.createSourceFile("file4.ts");
                ast.forgetNodesCreatedInBlock(remember => {
                    const classDec = newSourceFile.addClass({ name: "Class" });
                    classDec.forget();
                    expect(() => remember(classDec)).to.throw(errors.InvalidOperationError);
                });
            });

            it("should get exceptions thrown in the body", () => {
                expect(() => ast.forgetNodesCreatedInBlock(() => { throw new Error(""); })).to.throw();
            });
        });

        describe("asynchronous", async () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const sourceFile = ast.createSourceFile("file.ts");
            let interfaceDec: InterfaceDeclaration;
            let classDec: ClassDeclaration;
            await ast.forgetNodesCreatedInBlock(async remember => {
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

    describe("manipulating then getting something from the type checker", () => {
        it("should not error after manipulation", () => {
            const ast = new TsSimpleAst({ useVirtualFileSystem: true });
            const sourceFile = ast.createSourceFile("myFile.ts", `function myFunction(param: string) {}`);
            const param = sourceFile.getFunctions()[0].getParameters()[0];
            expect(param.getType().getText()).to.equal("string");
            param.setType("number");
            expect(param.getType().getText()).to.equal("number");
        });
    });
});
