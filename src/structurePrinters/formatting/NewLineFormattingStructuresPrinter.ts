import CodeBlockWriter from "code-block-writer";
import {StructurePrinter} from "../StructurePrinter";

export class NewLineFormattingStructuresPrinter<T> extends StructurePrinter<T[]> {
    constructor(writer: CodeBlockWriter, private readonly structurePrinter: StructurePrinter<T>) {
        super(writer);
    }

    printText(structures: T[] | undefined) {
        if (structures == null)
            return;
        for (let i = 0; i < structures.length; i++) {
            this.writer.conditionalNewLine(i > 0);
            this.structurePrinter.printText(structures[i]);
        }
    }
}
