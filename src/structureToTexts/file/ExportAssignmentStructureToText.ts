import * as errors from "../../errors";
import {ExportAssignmentStructure} from "../../structures";
import {NewLineFormattingStructuresToText} from "../formatting";
import {StructureToText} from "../StructureToText";

export class ExportAssignmentStructureToText extends StructureToText<ExportAssignmentStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresToText(this.writer, this);

    writeTexts(structures: ExportAssignmentStructure[] | undefined) {
        this.multipleWriter.writeText(structures);
    }

    writeText(structure: ExportAssignmentStructure) {
        this.writer.write("export");
        if (structure.isEqualsExport == null || structure.isEqualsExport === true)
            this.writer.write(" = ");
        else
            this.writer.write(" default ");

        this.writeTextOrWriterFunc(structure.expression);

        this.writer.write(";");
    }
}
