import * as ts from "typescript";
import {expect} from "chai";
import {Identifier, FunctionDeclaration} from "./../../../compiler";
import {getInfoFromText} from "./../testHelpers";

describe(nameof(Identifier), () => {
    describe(nameof<Identifier>(n => n.rename), () => {
        it("should rename", () => {
            const text = "function myFunction() {} const reference = myFunction;";
            const {firstChild, sourceFile} = getInfoFromText<FunctionDeclaration>(text);
            firstChild.getNameIdentifier().rename("newFunction");
            expect(sourceFile.getFullText()).to.equal(text.replace(/myFunction/g, "newFunction"));
        });
    });

    describe(nameof<Identifier>(n => n.findReferences), () => {
        it("should find all the references", () => {
            const {firstChild, sourceFile, tsSimpleAst} = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
            const secondSourceFile = tsSimpleAst.addSourceFileFromText("second.ts", "const reference2 = myFunction;");
            const referencedSymbols = firstChild.getNameIdentifier().findReferences();
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
            expect(references[0].getIsDefinition()).to.equal(true);
            expect(references[0].getIsInString()).to.equal(undefined);
            expect(references[0].getIsWriteAccess()).to.equal(true);
            expect(references[0].getNode().getParentOrThrow().getKind()).to.equal(ts.SyntaxKind.FunctionDeclaration);

            // second reference
            expect(references[1].getSourceFile()).to.equal(sourceFile);
            expect(references[1].getTextSpan().getStart()).to.equal(43);
            expect(references[1].getTextSpan().getLength()).to.equal("myFunction".length);
            expect(references[1].getIsDefinition()).to.equal(false);
            expect(references[1].getIsInString()).to.equal(undefined);
            expect(references[1].getIsWriteAccess()).to.equal(false);
            expect(references[1].getNode().getParentOrThrow().getKind()).to.equal(ts.SyntaxKind.VariableDeclaration);

            // third reference
            expect(references[2].getSourceFile()).to.equal(secondSourceFile);
            expect(references[2].getTextSpan().getStart()).to.equal(19);
            expect(references[2].getTextSpan().getLength()).to.equal("myFunction".length);
            expect(references[2].getIsDefinition()).to.equal(false);
            expect(references[2].getIsInString()).to.equal(undefined);
            expect(references[2].getIsWriteAccess()).to.equal(false);
            expect(references[2].getNode().getParentOrThrow().getKind()).to.equal(ts.SyntaxKind.VariableDeclaration);
        });
    });

    describe(nameof<Identifier>(n => n.getType), () => {
        function doTest(text: string, expectedTypes: string[]) {
            const {sourceFile} = getInfoFromText(text);
            const identifiers = sourceFile.getDescendantsOfKind(ts.SyntaxKind.Identifier) as Identifier[];
            expect(identifiers.map(i => i.getType().getText())).to.deep.equal(expectedTypes);
        }

        it("should get the identifier", () => {
            doTest("class Identifier {}\n var t = Identifier;", ["Identifier", "typeof Identifier", "typeof Identifier"]);
        });
    });
});
