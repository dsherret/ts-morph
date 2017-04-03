import {TsSimpleAst} from "./../TsSimpleAst";
import * as errors from "./../errors";
import * as testHelpers from "./testHelpers";
import {expect} from "chai";

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
            }).to.throw(errors.FileNotFoundError, "File not found: non-existent-file.ts");
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addSourceFiles), () => {
        // todo: would be more ideal to use a mocking framework here
        const fileSystem = testHelpers.getFileSystemHostWithFiles([{ filePath: "file1.ts", text: "" }, { filePath: "file2.ts", text: "" }]);
        fileSystem.glob = patterns => {
            if (patterns.length !== 1 || patterns[0] !== "some-pattern")
                throw new Error("Unexpected input!");
            return ["file1.ts", "file2.ts", "file3.ts"];
        };
        const ast = new TsSimpleAst(undefined, fileSystem);
        ast.addSourceFiles(["some-pattern"]);

        it("should have 2 source files", () => {
            const sourceFiles = ast.getSourceFiles();
            expect(sourceFiles.length).to.equal(2);
            expect(sourceFiles[0].getFileName()).to.equal("file1.ts");
            expect(sourceFiles[1].getFileName()).to.equal("file2.ts");
        });
    });

    describe(nameof<TsSimpleAst>(ast => ast.addSourceFileFromText), () => {
        it("should throw an exception if creating a source file at an existing path", () => {
            const ast = new TsSimpleAst();
            ast.addSourceFileFromText("file.ts", "");
            expect(() => {
                ast.addSourceFileFromText("file.ts", "");
            }).to.throw(errors.InvalidOperationError, "A source file already exists at the provided file path: file.ts");
        });

        it("", () => {
            // todo: remove
            const ast = new TsSimpleAst();
            const sourceFile = ast.addSourceFileFromText("MyFile.ts", "enum MyEnum {\n    myMember\n}\nlet myEnum: MyEnum;\nlet myOtherEnum: MyNewEnum;");
            const enumDef = sourceFile.getEnumDeclarations()[0];
            enumDef.setName("NewName");
            const addedEnum = sourceFile.addEnumDeclaration({
                name: "MyNewEnum"
            });
            addedEnum.setName("MyOtherNewName");
            const enumMember = enumDef.getMembers()[0];
            enumMember.setName("myNewMemberName");
            expect(enumMember.getValue()).to.equal(0);
            expect(sourceFile.getFullText()).to.equal("enum NewName {\n    myNewMemberName\n}\nlet myEnum: NewName;\nlet myOtherEnum: MyOtherNewName;\nenum MyOtherNewName {\n}\n");
        });
    });
});
