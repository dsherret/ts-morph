import { CodeBlockWriter } from "../../codeBlockWriter";
import { MethodSignatureStructure } from "../../structures";
import { NewLineFormattingStructuresPrinter } from "../formatting";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class MethodSignatureStructurePrinter extends FactoryStructurePrinter<MethodSignatureStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: MethodSignatureStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: MethodSignatureStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        writer.write(structure.name);
        writer.conditionalWrite(structure.hasQuestionToken, "?");
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        this.factory.forParameterDeclaration().printTexts(writer, structure.parameters);
        writer.write(")");
        if (structure.returnType != null && structure.returnType.length > 0)
            writer.write(`: ${structure.returnType}`);
        writer.write(";");
    }
}
