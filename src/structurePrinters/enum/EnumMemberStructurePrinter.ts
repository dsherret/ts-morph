import { CodeBlockWriter } from "../../codeBlockWriter";
import { EnumMemberStructure } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { CommaNewLineSeparatedStructuresPrinter } from "../formatting";

export class EnumMemberStructurePrinter extends NodePrinter<EnumMemberStructure> {
    private readonly multipleWriter = new CommaNewLineSeparatedStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<EnumMemberStructure> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: EnumMemberStructure) {
        this.factory.forJSDoc().printDocs(writer, structure.docs);
        writer.write(structure.name);
        if (typeof structure.value === "string")
            writer.write(` = `).quote(structure.value);
        else if (typeof structure.value === "number")
            writer.write(` = ${structure.value}`);
        else
            this.factory.forInitializerExpressionableNode().printText(writer, structure);
    }
}
