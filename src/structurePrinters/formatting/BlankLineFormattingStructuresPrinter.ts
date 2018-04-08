import CodeBlockWriter from "code-block-writer";
import {StructurePrinter} from "../StructurePrinter";

export class BlankLineFormattingStructuresPrinter<T> extends StructurePrinter<T[]> {
    constructor(writer: CodeBlockWriter, private readonly structurePrinter: StructurePrinter<T>) {
        super(writer);
    }

    printText(structures: T[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            this.writer.conditionalBlankLine(i > 0);
            this.structurePrinter.printText(structures[i]);
        }
    }
}
