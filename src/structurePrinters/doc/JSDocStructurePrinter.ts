import CodeBlockWriter from "code-block-writer";
import {JSDocStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";

export class JSDocStructurePrinter extends StructurePrinter<JSDocStructure> {
    printText(writer: CodeBlockWriter, structure: JSDocStructure) {
        const lines = structure.description.split(/\r?\n/);
        writer.writeLine("/**");
        for (const line of lines)
            writer.writeLine(` * ${line}`);
        writer.write(" */");
    }

    printDocs(writer: CodeBlockWriter, structures: JSDocStructure[] | undefined) {
        if (structures == null)
            return;

        for (const structure of structures) {
            this.printText(writer, structure);
            writer.newLine();
        }
    }
}
