import * as path from "path";
import * as ts from "typescript";
import {expect} from "chai";
import {EmitResult} from "./../compiler";
import {TsSimpleAst} from "./../TsSimpleAst";
import {IndentationText} from "./../ManipulationSettings";
import {FileUtils} from "./../utils";
import * as errors from "./../errors";
import * as testHelpers from "./testHelpers";

describe(nameof(TsSimpleAst), () => {
    describe("constructor", () => {
        it("should throw an exception if providing both a tsconfig.json and compiler options.", () => {
            expect(() => {
                // tslint:disable-next-line
                new TsSimpleAst({
                    tsConfigFilePath: "",
                    compilerOptions: {}
                });
            }).to.throw(errors.InvalidOperationError, "Cannot set both tsConfigFilePath and compilerOptions.");
        });

        it("should set the manipulation settings if provided", () => {
            const ast = new TsSimpleAst({
                manipulationSettings: {
                    indentationText: IndentationText.EightSpaces
                }
            });

            expect(ast.manipulationSettings.getIndentationText()).to.equal(IndentationText.EightSpaces);
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.getOrAddSourceFileFromFilePath), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            expect(() => {
                ast.getOrAddSourceFileFromFilePath("non-existent-file.ts");
            }).to.throw(errors.FileNotFoundError, `File not found: ${FileUtils.getStandardizedAbsolutePath("non-existent-file.ts")}`);
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addSourceFiles), () => {
        // todo: would be more ideal to use a mocking framework here
        const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file1.ts", text: "" }, { filePath: "file2.ts", text: "" }]);
        fileSystem.glob = patterns => {
            if (patterns.length !== 1 || patterns[0] !== "some-pattern")
                throw new Error("Unexpected input!");
            return ["file1.ts", "file2.ts", "file3.ts"].map(p => FileUtils.getStandardizedAbsolutePath(p));
        };
        const ast = new TsSimpleAst(undefined, fileSystem);
        ast.addSourceFiles("some-pattern");

        it("should have 2 source files", () => {
            const sourceFiles = ast.getSourceFiles();
            expect(sourceFiles.length).to.equal(2);
            expect(sourceFiles[0].getFilePath()).to.equal(FileUtils.getStandardizedAbsolutePath("file1.ts"));
            expect(sourceFiles[0].isSaved()).to.be.true; // should be saved because it was read from the disk
            expect(sourceFiles[1].getFilePath()).to.equal(FileUtils.getStandardizedAbsolutePath("file2.ts"));
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addSourceFileFromText), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const ast = new TsSimpleAst();
            ast.addSourceFileFromText("file.ts", "");
            expect(() => {
                ast.addSourceFileFromText("file.ts", "");
            }).to.throw(errors.InvalidOperationError, `A source file already exists at the provided file path: ${FileUtils.getStandardizedAbsolutePath("file.ts")}`);
        });

        it("should mark the source file as having not been saved", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromText("file.ts", "");
            expect(sourceFile.isSaved()).to.be.false;
        });

        it("", () => {
            // todo: remove
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromText("MyFile.ts", "enum MyEnum {\n    myMember\n}\nlet myEnum: MyEnum;\nlet myOtherEnum: MyNewEnum;");
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

    describe(nameof<TsSimpleAst>(ast => ast.addSourceFileFromStructure), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const ast = new TsSimpleAst();
            ast.addSourceFileFromText("file.ts", "");
            expect(() => {
                ast.addSourceFileFromStructure("file.ts", {});
            }).to.throw(errors.InvalidOperationError, `A source file already exists at the provided file path: ${FileUtils.getStandardizedAbsolutePath("file.ts")}`);
        });

        it("should mark the source file as having not been saved", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromStructure("file.ts", {});
            expect(sourceFile.isSaved()).to.be.false;
        });

        it("should add a source file based on a structure", () => {
            // basic test
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromStructure("MyFile.ts", {
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
        ast.addSourceFiles(`${testFilesDirPath}/**/*.ts`);
        ast.addSourceFileFromText(
            path.join(testFilesDirPath, "variableTestFile.ts"),
            `import * as testClasses from "./testClasses";\n\nlet var = new testClasses.TestClass().name;\n`
        );

        it("should have 3 source files", () => {
            expect(ast.getSourceFiles().length).to.equal(3);
        });

        it("should rename an identifier appropriately", () => {
            const interfaceFile = ast.getSourceFile("testInterfaces.ts")!;
            interfaceFile.getInterfaces()[0].getProperties()[0].getNameIdentifier().rename("newName");
            const variableFile = ast.getSourceFile("variableTestFile.ts")!;
            expect(variableFile.getFullText()).to.equal(`import * as testClasses from "./testClasses";\n\nlet var = new testClasses.TestClass().newName;\n`);
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.removeSourceFile), () => {
        it("should remove the source file", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromText("myFile.ts", ``);
            expect(ast.removeSourceFile(sourceFile)).to.equal(true);
            expect(ast.removeSourceFile(sourceFile)).to.equal(false);
            expect(ast.getSourceFiles().length).to.equal(0);
            expect(() => sourceFile.getChildCount()).to.throw(); // should be disposed
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.saveUnsavedSourceFiles), () => {
        it("should save all the unsaved source files asynchronously", done => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            ast.addSourceFileFromText("file1.ts", "").saveSync();
            ast.addSourceFileFromText("file2.ts", "");
            ast.addSourceFileFromText("file3.ts", "");
            ast.saveUnsavedSourceFiles().then(() => {
                expect(ast.getSourceFiles().map(f => f.isSaved())).to.deep.equal([true, true, true]);
                expect(fileSystem.getWriteLog().length).to.equal(2); // 2 writes
                expect(fileSystem.getSyncWriteLog().length).to.equal(1); // 1 write
                done();
            });
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.saveUnsavedSourceFilesSync), () => {
        it("should save all the unsaved source files synchronously", () => {
            const fileSystem = testHelpers.getFileSystemHostWithFiles([]);
            const ast = new TsSimpleAst(undefined, fileSystem);
            ast.addSourceFileFromText("file1.ts", "").saveSync();
            ast.addSourceFileFromText("file2.ts", "");
            ast.addSourceFileFromText("file3.ts", "");
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
            ast.addSourceFileFromText("file1.ts", "const num1 = 1;");
            ast.addSourceFileFromText("file2.ts", "const num2 = 2;");
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

    describe("manipulating then getting something from the type checker", () => {
        it("should not error after manipulation", () => {
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromText("myFile.ts", `function myFunction(param: string) {}`);
            const param = sourceFile.getFunctions()[0].getParameters()[0];
            expect(param.getType().getText()).to.equal("string");
            param.setType("number");
            expect(param.getType().getText()).to.equal("number");
        });
    });
});
