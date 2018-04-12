import CodeBlockWriter from "code-block-writer";
import * as errors from "../../errors";
import {ExportAssignmentStructure} from "../../structures";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {StructurePrinter} from "../StructurePrinter";

export class ExportAssignmentStructurePrinter extends StructurePrinter<ExportAssignmentStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ExportAssignmentStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ExportAssignmentStructure) {
        writer.write("export");
        if (structure.isEqualsExport == null || structure.isEqualsExport === true)
            writer.write(" = ");
        else
            writer.write(" default ");

        this.printTextOrWriterFunc(writer, structure.expression);

        writer.write(";");
    }
}
