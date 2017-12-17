import * as path from "path";
import * as ts from "typescript";
import {expect} from "chai";
import {EmitResult, Node, SourceFile, NamespaceDeclaration} from "./../compiler";
import {TsSimpleAst} from "./../TsSimpleAst";
import {IndentationText} from "./../ManipulationSettings";
import {FileUtils} from "./../utils";
import * as errors from "./../errors";
import * as testHelpers from "./testHelpers";

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

        it(`should override the tsconfig options`, () => {
            const host = testHelpers.getFileSystemHostWithFiles([{ filePath: "tsconfig.json", text: `{ "compilerOptions": { "rootDir": "test", "target": "ES5" } }` }]);
            const ast = new TsSimpleAst({
                tsConfigFilePath: "tsconfig.json",
                compilerOptions: {
                    target: 2,
                    allowJs: true
                }
            }, host);
            expect(ast.getCompilerOptions()).to.deep.equal({ rootDir: "test", target: 2, allowJs: true });
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

    describe(nameof<TsSimpleAst>(ast => ast.addExistingSourceFile), () => {
        it("should throw an exception if adding a source file at a non-existent path", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            expect(() => {
                ast.addExistingSourceFile("non-existent-file.ts");
            }).to.throw(errors.FileNotFoundError, `File not found: ${FileUtils.getStandardizedAbsolutePath("non-existent-file.ts")}`);
        });

        it("should add a source file that exists", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file.ts", text: "" }]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            const sourceFile = ast.addExistingSourceFile("file.ts");
            expect(sourceFile).to.not.be.undefined;
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addExistingSourceFiles), () => {
        // todo: would be more ideal to use a mocking framework here
        const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file1.ts", text: "" }, { filePath: "file2.ts", text: "" }]);
        fileSystem.glob = patterns => {
            if (patterns.length !== 1 || patterns[0] !== "some-pattern")
                throw new Error("Unexpected input!");
            return ["file1.ts", "file2.ts", "file3.ts"].map(p => FileUtils.getStandardizedAbsolutePath(p));
        };
        const ast = new TsSimpleAst(undefined, fileSystem);
        const result = ast.addExistingSourceFiles("some-pattern");

        it("should have 2 source files", () => {
            const sourceFiles = ast.getSourceFiles();
            expect(sourceFiles.length).to.equal(2);
            expect(result).to.deep.equal(sourceFiles);
            expect(sourceFiles[0].getFilePath()).to.equal(FileUtils.getStandardizedAbsolutePath("file1.ts"));
            expect(sourceFiles[0].isSaved()).to.be.true; // should be saved because it was read from the disk
            expect(sourceFiles[1].getFilePath()).to.equal(FileUtils.getStandardizedAbsolutePath("file2.ts"));
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.createSourceFile), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const ast = new TsSimpleAst();
            ast.createSourceFile("file.ts", "");
            expect(() => {
                ast.createSourceFile("file.ts", "");
            }).to.throw(errors.InvalidOperationError, `A source file already exists at the provided file path: ${FileUtils.getStandardizedAbsolutePath("file.ts")}`);
        });

        it("should mark the source file as having not been saved", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.createSourceFile("file.ts", "");
            expect(sourceFile.isSaved()).to.be.false;
        });

        it("", () => {
            // todo: remove
            const ast = new TsSimpleAst();
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
            const ast = new TsSimpleAst();
            ast.createSourceFile("file.ts", "");
            expect(() => {
                ast.createSourceFile("file.ts", {});
            }).to.throw(errors.InvalidOperationError, `A source file already exists at the provided file path: ${FileUtils.getStandardizedAbsolutePath("file.ts")}`);
        });

        it("should mark the source file as having not been saved", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.createSourceFile("file.ts", {});
            expect(sourceFile.isSaved()).to.be.false;
        });

        it("should add a source file based on a structure", () => {
            // basic test
            const ast = new TsSimpleAst();
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

        it("should have 3 source files", () => {
            expect(ast.getSourceFiles().length).to.equal(3);
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
            const ast = new TsSimpleAst();
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
        function setup(compilerOptions: ts.CompilerOptions) {
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
            const ast = new TsSimpleAst();
            ast.createSourceFile("dir/file.ts");
            const expectedFile = ast.createSourceFile("file.ts");
            expect(ast.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });

        it("should get the first match based on the directory structure when swapping the order fo what was created first", () => {
            const ast = new TsSimpleAst();
            const expectedFile = ast.createSourceFile("file.ts");
            ast.createSourceFile("dir/file.ts");
            expect(ast.getSourceFile("file.ts")!.getFilePath()).to.equal(expectedFile.getFilePath());
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getSourceFileOrThrow), () => {
        it("should throw when it can't find the source file based on a provided path", () => {
            const ast = new TsSimpleAst();
            expect(() => ast.getSourceFileOrThrow("some path")).to.throw();
        });

        it("should throw when it can't find the source file based on a provided condition", () => {
            const ast = new TsSimpleAst();
            expect(() => ast.getSourceFileOrThrow(s => false)).to.throw();
        });

        it("should not throw when it finds the file", () => {
            const ast = new TsSimpleAst();
            ast.createSourceFile("myFile.ts", "");
            expect(ast.getSourceFileOrThrow("myFile.ts").getFilePath()).to.contain("myFile.ts");
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getSourceFiles), () => {
        it("should get all the source files added to the ast sorted by directory structure", () => {
            const ast = new TsSimpleAst();
            ast.createSourceFile("dir/child/file.ts");
            ast.createSourceFile("dir/file.ts");
            ast.createSourceFile("file1.ts");
            ast.createSourceFile("file2.ts");
            expect(ast.getSourceFiles().map(s => s.getFilePath())).to.deep.equal([
                FileUtils.getStandardizedAbsolutePath("file1.ts"),
                FileUtils.getStandardizedAbsolutePath("file2.ts"),
                FileUtils.getStandardizedAbsolutePath("dir/file.ts"),
                FileUtils.getStandardizedAbsolutePath("dir/child/file.ts")
            ]);
        });

        it("should be able to do a file glob", () => {
            const ast = new TsSimpleAst();
            ast.createSourceFile("file.ts", "");
            ast.createSourceFile("src/file.ts", "");
            ast.createSourceFile("src/test/file1.ts", "");
            ast.createSourceFile("src/test/file2.ts", "");
            ast.createSourceFile("src/test/file3.ts", "");
            ast.createSourceFile("src/test/file3.js", "");
            ast.createSourceFile("src/test/folder/file.ts", "");
            expect(ast.getSourceFiles("**/src/test/**/*.ts").map(s => s.getFilePath())).to.deep.equal([
                FileUtils.getStandardizedAbsolutePath("src/test/file1.ts"),
                FileUtils.getStandardizedAbsolutePath("src/test/file2.ts"),
                FileUtils.getStandardizedAbsolutePath("src/test/file3.ts"),
                FileUtils.getStandardizedAbsolutePath("src/test/folder/file.ts")
            ]);
        });
    });

    describe(nameof<TsSimpleAst>(t => t.forgetNodesCreatedInBlock), () => {
        const ast = new TsSimpleAst();
        let sourceFile: SourceFile;
        let sourceFileNotNavigated: SourceFile;
        let classNode: Node;
        let namespaceNode: NamespaceDeclaration;
        let namespaceKeywordNode: Node;
        let interfaceNode1: Node;
        let interfaceNode2: Node;
        let interfaceNode3: Node;
        let interfaceNode4: Node;
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
                remember2(interfaceNode3, interfaceNode4);
            });

            namespaceKeywordNode = namespaceNode.getFirstChildByKindOrThrow(ts.SyntaxKind.NamespaceKeyword);
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

        it("should not have forgotten the third interface because it was remembered", () => {
            expect(interfaceNode4.wasForgotten()).to.be.false;
        });
    });

    describe("manipulating then getting something from the type checker", () => {
        it("should not error after manipulation", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.createSourceFile("myFile.ts", `function myFunction(param: string) {}`);
            const param = sourceFile.getFunctions()[0].getParameters()[0];
            expect(param.getType().getText()).to.equal("string");
            param.setType("number");
            expect(param.getType().getText()).to.equal("number");
        });
    });
});
