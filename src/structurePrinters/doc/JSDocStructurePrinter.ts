import {JSDocStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";

export class JSDocStructurePrinter extends StructurePrinter<JSDocStructure> {
    printText(structure: JSDocStructure) {
        const lines = structure.description.split(/\r?\n/);
        this.writer.writeLine("/**");
        for (const line of lines)
            this.writer.writeLine(` * ${line}`);
        this.writer.write(" */");
    }

    printDocs(structures: JSDocStructure[] | undefined) {
        if (structures == null)
            return;

        for (const structure of structures) {
            this.printText(structure);
            this.writer.newLine();
        }
    }
}
