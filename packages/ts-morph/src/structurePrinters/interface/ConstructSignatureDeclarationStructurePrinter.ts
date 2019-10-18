import { CodeBlockWriter } from "../../codeBlockWriter";
import { ConstructSignatureDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class ConstructSignatureDeclarationStructurePrinter extends NodePrinter<OptionalKind<ConstructSignatureDeclarationStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ConstructSignatureDeclarationStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);

        writer.write("new");
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        this.factory.forParameterDeclaration().printTextsWithParenthesis(writer, structure.parameters);
        this.factory.forReturnTypedNode().printText(writer, structure);
        writer.write(";");
    }
}
