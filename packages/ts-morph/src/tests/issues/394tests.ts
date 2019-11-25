import { FileSystemHost, InMemoryFileSystemHost } from "@ts-morph/common";
import { expect } from "chai";
import { SourceFile } from "../../compiler";
import { Project } from "../../Project";
describe("tests for issue #394", () => {
    it("should get the original source file with correct casing when the module specifier has incorrect casing and using a case insensitive file system", () => {
        const fileSystem = new InMemoryFileSystemHost({ skipLoadingLibFiles: true });
        const sourceFiles: SourceFile[] = [];
        fileSystem.fileExistsSync = filePath => sourceFiles.some(s => s.getFilePath().toLowerCase() === filePath.toLowerCase());
        fileSystem.readFileSync = filePath => {
            const searchingFile = sourceFiles.find(s => s.getFilePath().toLowerCase() === filePath.toLowerCase());
            return searchingFile?.getFullText() ?? "";
        };
        fileSystem.isCaseSensitive = () => false;

        const project = new Project({ fileSystem });
        const interfaceSourceFile = project.createSourceFile("/folder/MyInterface.ts", "export interface MyInterface {}");
        const sourceFile = project.createSourceFile("/folder/main.ts", "import { MyInterface } from './myInterface';\n\nlet myVar: MyInterface;");
        sourceFiles.push(interfaceSourceFile, sourceFile);
        const varDeclaration = sourceFile.getVariableDeclarationOrThrow("myVar");
        const declarations = varDeclaration.getType().getSymbolOrThrow().getDeclarations();

        expect(declarations[0].getSourceFile().getFilePath()).to.equal("/folder/MyInterface.ts");
        expect(declarations[0].getSourceFile()).to.equal(interfaceSourceFile);
    });

    it("should not be able to get the source file symbol when the module specifier has incorrect casing and using a case sensitive file system", () => {
        const project = new Project({ useInMemoryFileSystem: true });
        const interfaceSourceFile = project.createSourceFile("/folder/MyInterface.ts", "export interface MyInterface {}");
        const sourceFile = project.createSourceFile("/folder/main.ts", "import { MyInterface } from './myInterface';\n\nlet myVar: MyInterface;");
        const varDeclaration = sourceFile.getVariableDeclarationOrThrow("myVar");
        const symbol = varDeclaration.getType().getSymbol();

        expect(symbol).to.be.undefined;
    });
});
