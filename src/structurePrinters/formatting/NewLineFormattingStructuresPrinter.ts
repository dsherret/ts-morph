import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinter } from "../StructurePrinter";

export class NewLineFormattingStructuresPrinter<T> extends StructurePrinter<T[]> {
    constructor(private readonly structurePrinter: StructurePrinter<T>) {
        super();
    }

    printText(writer: CodeBlockWriter, structures: T[] | undefined) {
        if (structures == null)
            return;
        for (let i = 0; i < structures.length; i++) {
            writer.conditionalNewLine(i > 0);
            this.structurePrinter.printText(writer, structures[i]);
        }
    }
}
