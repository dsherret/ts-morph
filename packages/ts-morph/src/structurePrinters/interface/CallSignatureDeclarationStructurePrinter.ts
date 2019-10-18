import { CodeBlockWriter } from "../../codeBlockWriter";
import { CallSignatureDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class CallSignatureDeclarationStructurePrinter extends NodePrinter<OptionalKind<CallSignatureDeclarationStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<CallSignatureDeclarationStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);

        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        this.factory.forParameterDeclaration().printTextsWithParenthesis(writer, structure.parameters);
        this.factory.forReturnTypedNode(true).printText(writer, structure);
        writer.write(";");
    }
}
