import CodeBlockWriter from "code-block-writer";
import {StructurePrinter} from "../StructurePrinter";

export class CommaNewLineSeparatedStructuresPrinter<T> extends StructurePrinter<T[]> {
    constructor(writer: CodeBlockWriter, private readonly structurePrinter: StructurePrinter<T>) {
        super(writer);
    }

    printText(structures: T[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                this.writer.write(",").newLine();
            this.structurePrinter.printText(structures[i]);
        }
    }
}
