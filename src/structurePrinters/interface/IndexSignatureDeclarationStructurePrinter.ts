import { CodeBlockWriter } from "../../codeBlockWriter";
import { IndexSignatureDeclarationStructure } from "../../structures";
import { printTextFromStringOrWriter } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class IndexSignatureDeclarationStructurePrinter extends FactoryStructurePrinter<IndexSignatureDeclarationStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: IndexSignatureDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: IndexSignatureDeclarationStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        this.factory.forModifierableNode().printText(writer, structure);
        writer.write(`[${structure.keyName || "key"}: ${structure.keyType || "string"}]: `);
        printTextFromStringOrWriter(writer, structure.returnType);
        writer.write(";");
    }
}
