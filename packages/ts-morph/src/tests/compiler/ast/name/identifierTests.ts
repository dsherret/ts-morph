import { SyntaxKind, ts } from "@ts-morph/common";
import { expect } from "chai";
import { FunctionDeclaration, Identifier, InterfaceDeclaration, NamespaceDeclaration, PropertyAccessExpression } from "../../../../compiler";
import { Project } from "../../../../Project";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(Identifier), () => {
    describe(nameof<Identifier>(n => n.rename), () => {
        it("should rename", () => {
            const text = "function myFunction() {} const reference = myFunction;";
            const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(text);
            firstChild.getNameNodeOrThrow().rename("newFunction");
            expect(sourceFile.getFullText()).to.equal(text.replace(/myFunction/g, "newFunction"));
        });

        it("should rename an identifier to a ThisKeyword", () => {
            const text = "const that = this; that.test;";
            const { sourceFile } = getInfoFromText(text);
            const thatIdentifier = sourceFile.getFirstDescendantOrThrow(d => d.getKind() === SyntaxKind.Identifier && d.getText() === "that") as Identifier;
            thatIdentifier.rename("this");
            expect(thatIdentifier.wasForgotten()).to.be.true;
            expect(sourceFile.getFullText()).to.equal("const this = this; this.test;");
        });
    });

    describe(nameof<Identifier>(n => n.getDefinitions), () => {
        it("should get the definition", () => {
            const sourceFileText = "function myFunction() {}\nconst reference = myFunction;";
            const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>(sourceFileText);
            const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = myFunction;");
            const definitions = (secondSourceFile.getVariableDeclarationOrThrow("reference2").getInitializerOrThrow() as any as Identifier).getDefinitions();
            expect(definitions.length).to.equal(1);
            expect(definitions[0].getName()).to.equal("myFunction");
            expect(definitions[0].getSourceFile().getFullText()).to.equal(sourceFileText);
            expect(definitions[0].getKind()).to.equal(ts.ScriptElementKind.functionElement);
            expect(definitions[0].getTextSpan().getStart()).to.equal(firstChild.getNameNodeOrThrow().getStart());
            expect(definitions[0].getDeclarationNode()).to.equal(firstChild);
        });

        it("should get the definition when nested inside a namespace", () => {
            const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>(
                "namespace N { export function myFunction() {} }\nconst reference = N.myFunction;"
            );
            const definitions = (sourceFile.getVariableDeclarationOrThrow("reference").getInitializerOrThrow() as PropertyAccessExpression)
                .getNameNode().getDefinitions();

            expect(definitions.length).to.equal(1);
            expect(definitions[0].getDeclarationNode()).to.equal(firstChild.getFunctions()[0]);
        });
    });

    describe(nameof<Identifier>(n => n.getImplementations), () => {
        it("should get the implementations", () => {
            const sourceFileText = "interface MyInterface {}\nexport class Class1 implements MyInterface {}\nclass Class2 implements MyInterface {}";
            const { firstChild, sourceFile, project } = getInfoFromText<InterfaceDeclaration>(sourceFileText);
            const implementations = firstChild.getNameNode().getImplementations();
            expect(implementations.length).to.equal(2);
            expect(implementations[0].getNode().getText()).to.equal("Class1");
            expect(implementations[1].getNode().getText()).to.equal("Class2");
        });
    });

    describe(nameof<Identifier>(n => n.findReferences), () => {
        it("should find all the references", () => {
            const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
            const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = myFunction;");
            const referencedSymbols = firstChild.getNameNodeOrThrow().findReferences();
            expect(referencedSymbols.length).to.equal(1);
            const referencedSymbol = referencedSymbols[0];
            const references = referencedSymbol.getReferences();

            // definition
            const definition = referencedSymbol.getDefinition();
            expect(definition.getSourceFile()).to.equal(sourceFile);
            expect(definition.getContainerName()).to.equal("");
            expect(definition.getContainerKind()).to.equal("");
            expect(definition.getKind()).to.equal("function");
            expect(definition.getName()).to.equal("function myFunction(): void");
            expect(definition.getTextSpan().getStart()).to.equal(9);
            expect(definition.getTextSpan().getLength()).to.equal("myFunction".length);
            expect(definition.getDisplayParts()[0].getText()).to.equal("function"); // only bother testing the first one
            expect(definition.getDisplayParts()[0].getKind()).to.equal("keyword");

            // first reference
            expect(references[0].getSourceFile()).to.equal(sourceFile);
            expect(references[0].getTextSpan().getStart()).to.equal(9);
            expect(references[0].getTextSpan().getLength()).to.equal("myFunction".length);
            expect(references[0].isDefinition()).to.equal(true);
            expect(references[0].isInString()).to.equal(undefined);
            expect(references[0].isWriteAccess()).to.equal(true);
            expect(references[0].getNode().getParentOrThrow().getKind()).to.equal(SyntaxKind.FunctionDeclaration);

            // second reference
            expect(references[1].getSourceFile()).to.equal(sourceFile);
            expect(references[1].getTextSpan().getStart()).to.equal(43);
            expect(references[1].getTextSpan().getLength()).to.equal("myFunction".length);
            expect(references[1].isDefinition()).to.equal(false);
            expect(references[1].isInString()).to.equal(undefined);
            expect(references[1].isWriteAccess()).to.equal(false);
            expect(references[1].getNode().getParentOrThrow().getKind()).to.equal(SyntaxKind.VariableDeclaration);

            // third reference
            expect(references[2].getSourceFile()).to.equal(secondSourceFile);
            expect(references[2].getTextSpan().getStart()).to.equal(19);
            expect(references[2].getTextSpan().getLength()).to.equal("myFunction".length);
            expect(references[2].isDefinition()).to.equal(false);
            expect(references[2].isInString()).to.equal(undefined);
            expect(references[2].isWriteAccess()).to.equal(false);
            expect(references[2].getNode().getParentOrThrow().getKind()).to.equal(SyntaxKind.VariableDeclaration);
        });

        it("should get the right node when the reference is at the start of a property access expression", () => {
            const { firstChild, sourceFile, project } = getInfoFromText<NamespaceDeclaration>(`
namespace MyNamespace {
    export class MyClass {
    }
}

const t = MyNamespace.MyClass;
`);
            const referencedSymbols = firstChild.getNameNode().findReferences();
            expect(referencedSymbols.length).to.equal(1);
            const referencedSymbol = referencedSymbols[0];
            const references = referencedSymbol.getReferences();
            const propAccessExpr = sourceFile.getVariableDeclarations()[0].getInitializerOrThrow() as PropertyAccessExpression;
            expect(references[1].getNode()).to.equal(propAccessExpr.getExpression());
        });
    });

    describe(nameof<Identifier>(n => n.findReferencesAsNodes), () => {
        it("should find all the references and exclude the definition", () => {
            const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
            const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = myFunction;");
            const referencingNodes = firstChild.getNameNodeOrThrow().findReferencesAsNodes();
            expect(referencingNodes.length).to.equal(2);
            expect(referencingNodes[0].getParentOrThrow().getText()).to.equal("reference = myFunction");
            expect(referencingNodes[1].getParentOrThrow().getText()).to.equal("reference2 = myFunction");
        });
    });

    describe(nameof<Identifier>(n => n.getDefinitionNodes), () => {
        it("should get the definition nodes", () => {
            const { sourceFile } = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
            const definitionNodes = sourceFile.getVariableDeclarationOrThrow("reference")
                .getInitializerIfKindOrThrow(SyntaxKind.Identifier)
                .getDefinitionNodes();
            expect(definitionNodes.length).to.equal(1);
            expect(definitionNodes[0].getText()).to.equal("function myFunction() {}");
        });

        it("should get the namespace import identifier of one that's exported from an imported namespace export that doesn't import a namespace", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import * as ts from "./Test"; export { ts };`);
            project.createSourceFile("Test.ts", `export class Test {}`);

            expect(mainSourceFile.getExportDeclarations()[0].getNamedExports()[0].getNameNode().getDefinitionNodes().map(t => t.getText()))
                .to.deep.equal([`export class Test {}`].sort());
        });
    });

    describe(nameof<Identifier>(n => n.getType), () => {
        function doTest(text: string, expectedTypes: string[]) {
            const { sourceFile } = getInfoFromText(text);
            const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier);
            expect(identifiers.map(i => i.getType().getText())).to.deep.equal(expectedTypes);
        }

        it("should get the identifier", () => {
            doTest("class Identifier {}\n var t = Identifier;", ["Identifier", "typeof Identifier", "typeof Identifier"]);
        });
    });
});
