import { CodeBlockWriter } from "../../codeBlockWriter";
import { ConstructSignatureDeclarationStructure } from "../../structures";
import { NewLineFormattingStructuresPrinter } from "../formatting";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class ConstructSignatureDeclarationStructurePrinter extends FactoryStructurePrinter<ConstructSignatureDeclarationStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ConstructSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ConstructSignatureDeclarationStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        writer.write("new");
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        this.factory.forParameterDeclaration().printTexts(writer, structure.parameters);
        writer.write(")");
        if (structure.returnType != null && structure.returnType.length > 0)
            writer.write(`: ${structure.returnType}`);
        writer.write(";");
    }
}
