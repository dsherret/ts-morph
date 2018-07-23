import { Project } from "../../Project";
import { SyntaxKind } from "../../typescript";
import { TypeGuards } from "../../utils";
import { expect } from "chai";

describe("examples in docs/utilities.md", () => {
    it("structures example 1 should work", () => {
        const code = `const a = 1;`;
        const project = new Project({ useVirtualFileSystem: true });
        const sourceFile = project.createSourceFile("one.ts", code);
        const a = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration)[0];

        // now let's get a's structure and use it for creating a new variable declaration.
        const structure = a.getStructure();
        structure.name = "b";
        structure.type = "string";
        structure.initializer = "'so artificial'";

        // we are ready to add it to the parent declaration list, just next to "a".
        const parent = a.getAncestors().find(TypeGuards.isVariableDeclarationList)!;
        const newDeclarations = parent.addDeclaration(structure);

        expect(sourceFile.getText()).to.equals("const a = 1, b: string = 'so artificial';");

        // and now demonstrate the use of fill() for changing existing "a" variable:
        structure.type = "Promise<Date>";
        structure.initializer = "Promise.resolve(new Date())";
        a.fill(structure);

        expect(sourceFile.getText()).to.equals(
            "const a: Promise<Date> = Promise.resolve(new Date()), b: string = 'so artificial';");

        // and of course we can serialize structures to text and re-create the nodes after:
        const parentStatement = a.getAncestors().find(TypeGuards.isVariableStatement)!;
        const str = JSON.stringify(parentStatement.getStructure());
        const emptyFile = project.createSourceFile("other.ts", "");
        emptyFile.addVariableStatement(JSON.parse(str));
        expect(emptyFile.getText()).to.equals(
            "const a: Promise<Date> = Promise.resolve(new Date()), b: string = 'so artificial';\n");

    });

});
