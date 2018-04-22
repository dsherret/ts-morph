import CodeBlockWriter from "code-block-writer";
import * as errors from "../../errors";
import { ExportAssignmentStructure } from "../../structures";
import { NewLineFormattingStructuresPrinter } from "../formatting";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class ExportAssignmentStructurePrinter extends FactoryStructurePrinter<ExportAssignmentStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ExportAssignmentStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ExportAssignmentStructure) {
        writer.write("export");
        if (structure.isExportEquals !== false)
            writer.write(" = ");
        else
            writer.write(" default ");

        this.printTextOrWriterFunc(writer, structure.expression);

        writer.write(";");
    }
}
