import * as errors from "../../errors";
import {ExportAssignmentStructure} from "../../structures";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {StructurePrinter} from "../StructurePrinter";

export class ExportAssignmentStructurePrinter extends StructurePrinter<ExportAssignmentStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this.writer, this);

    printTexts(structures: ExportAssignmentStructure[] | undefined) {
        this.multipleWriter.printText(structures);
    }

    printText(structure: ExportAssignmentStructure) {
        this.writer.write("export");
        if (structure.isEqualsExport == null || structure.isEqualsExport === true)
            this.writer.write(" = ");
        else
            this.writer.write(" default ");

        this.printTextOrWriterFunc(structure.expression);

        this.writer.write(";");
    }
}
