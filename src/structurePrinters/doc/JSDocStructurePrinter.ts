import { CodeBlockWriter } from "../../codeBlockWriter";
import { JSDocStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class JSDocStructurePrinter extends FactoryStructurePrinter<JSDocStructure> {
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
