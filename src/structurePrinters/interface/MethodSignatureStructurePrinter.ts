import { CodeBlockWriter } from "../../codeBlockWriter";
import { MethodSignatureStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class MethodSignatureStructurePrinter extends NodePrinter<OptionalKind<MethodSignatureStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<MethodSignatureStructure>) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        this.factory.forParameterDeclaration().printTextsWithParenthesis(writer, structure.parameters);
        this.factory.forReturnTypedNode().printText(writer, structure);
        writer.write(";");
    }
}
