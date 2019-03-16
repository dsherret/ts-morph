import { CodeBlockWriter } from "../../codeBlockWriter";
import { ExportAssignmentStructure, OptionalKind } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class ExportAssignmentStructurePrinter extends FactoryStructurePrinter<OptionalKind<ExportAssignmentStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ExportAssignmentStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: OptionalKind<ExportAssignmentStructure>) {
        writer.write("export");
        if (structure.isExportEquals !== false)
            writer.write(" = ");
        else
            writer.write(" default ");

        writer.write(this.getTextWithQueuedChildIndentation(writer, structure.expression)).write(";");
    }
}
