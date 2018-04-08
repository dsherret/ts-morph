import {EnumMemberStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {JSDocStructurePrinter} from "../doc";
import {CommaNewLineSeparatedStructuresPrinter} from "../formatting";

export class EnumMemberStructurePrinter extends StructurePrinter<EnumMemberStructure> {
    private readonly multipleWriter = new CommaNewLineSeparatedStructuresPrinter(this.writer, this);
    private readonly jsDocWriter = new JSDocStructurePrinter(this.writer);

    printTexts(structures: EnumMemberStructure[] | undefined) {
        this.multipleWriter.printText(structures);
    }

    printText(structure: EnumMemberStructure) {
        this.jsDocWriter.printDocs(structure.docs);
        this.writer.write(structure.name);
        if (typeof structure.value === "string")
            this.writer.write(` = `).quote(structure.value);
        else if (typeof structure.value === "number")
            this.writer.write(` = ${structure.value}`);
        else if (structure.initializer != null)
            this.writer.write(` = ${structure.initializer}`);
    }
}
