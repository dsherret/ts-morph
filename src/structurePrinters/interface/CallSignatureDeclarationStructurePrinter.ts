import CodeBlockWriter from "code-block-writer";
import { CallSignatureDeclarationStructure } from "../../structures";
import { NewLineFormattingStructuresPrinter } from "../formatting";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class CallSignatureDeclarationStructurePrinter extends FactoryStructurePrinter<CallSignatureDeclarationStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: CallSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: CallSignatureDeclarationStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forTypeParameterDeclaration().printTextsWithBrackets(writer, structure.typeParameters);
        writer.write("(");
        this.factory.forParameterDeclaration().printTexts(writer, structure.parameters);
        writer.write(")");
        writer.write(`: ${structure.returnType || "void"}`);
        writer.write(";");
    }
}
