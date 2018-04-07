import * as errors from "../../errors";
import {ExportAssignmentStructure} from "../../structures";
import {StructureToText} from "../StructureToText";

export class ExportAssignmentStructureToText extends StructureToText<ExportAssignmentStructure> {
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
