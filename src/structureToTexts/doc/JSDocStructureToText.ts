import {JSDocStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class JSDocStructureToText extends StructureToText<JSDocStructure> {
    writeText(structure: JSDocStructure) {
        const lines = structure.description.split(/\r?\n/);
        this.writer.writeLine("/**");
        for (const line of lines) {
            this.writer.writeLine(` * ${line}`);
        }
        this.writer.writeLine(" */");
    }

    writeDocs(structures: JSDocStructure[] | undefined) {
        if (structures == null)
            return;

        for (const structure of structures)
            this.writeText(structure);
    }
}
