import { expect } from "chai";
import { getInfoFromText } from "../compiler/testHelpers";

describe("tests for issue #494", () => {
    it("should get declarations of import", () => {
        const { project } = getInfoFromText("");
        const importsFile = project.createSourceFile("imports.ts", `import { Pizza } from "./Food";`);
        const pizzaClassText = "export class Pizza { }";
        project.createSourceFile("Food.ts", pizzaClassText);
        const foodImport = importsFile.getImportDeclarationOrThrow("./Food");
        const pizzaImport = foodImport.getNamedImports()[0].getNameNode();

        // get via symbol
        const pizzaAliasedSymbol = pizzaImport.getSymbolOrThrow().getAliasedSymbolOrThrow();
        expect(pizzaAliasedSymbol.getDeclarations().map(d => d.getText())).to.deep.equal([pizzaClassText]);

        // alternatively, use "go to definition"
        const definitions = pizzaImport.getDefinitions();
        expect(definitions.map(d => d.getNode().getParentOrThrow().getText())).to.deep.equal([pizzaClassText]);
    });
});
