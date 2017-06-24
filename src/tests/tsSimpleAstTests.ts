import * as path from "path";
import {expect} from "chai";
import {TsSimpleAst} from "./../TsSimpleAst";
import {FileUtils} from "./../utils";
import * as errors from "./../errors";
import * as testHelpers from "./testHelpers";

describe(nameof(TsSimpleAst), () => {
    describe(`constructor`, () => {
        it("should throw an exception if providing both a tsconfig.json and compiler options.", () => {
            expect(() => {
                // tslint:disable-next-line
                new TsSimpleAst({
                    tsConfigFilePath: "",
                    compilerOptions: {}
                });
            }).to.throw(errors.InvalidOperationError, "Cannot set both tsConfigFilePath and compilerOptions.");
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
            interfaceFile.getInterfaces()[0].getProperties()[0].getNameNode().rename("newName");
            const variableFile = ast.getSourceFile("variableTestFile.ts")!;
            expect(variableFile.getFullText()).to.equal(`import * as testClasses from "./testClasses";\n\nlet var = new testClasses.TestClass().newName;\n`);
        });
    });
});
