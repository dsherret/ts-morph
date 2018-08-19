import { expect } from "chai";
import { SyntaxKind } from "../../typescript";
import { Project } from "../../Project";

describe("tests for issue #394", () => {
    it("should get the original source file with correct casing for the file name when retrieved via a symbol", () => {
        const searchingFilePath = "/folder/MyInterface.ts";
        const project = new Project({ useVirtualFileSystem: true });
        const interfaceSourceFile = project.createSourceFile(searchingFilePath, "export interface MyInterface {}");
        const sourceFile = project.createSourceFile("/folder/main.ts", "import { MyInterface } from './MyInterface';\n\nlet myVar: MyInterface;");
        const varDeclaration = sourceFile.getVariableDeclarationOrThrow("myVar");
        const declarations = varDeclaration.getType().getSymbolOrThrow().getDeclarations();

        expect(declarations[0].getSourceFile().getFilePath()).to.equal(searchingFilePath);
        expect(declarations[0].getSourceFile()).to.equal(interfaceSourceFile);
    });
});
