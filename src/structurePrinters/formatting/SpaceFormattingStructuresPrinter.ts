import CodeBlockWriter from "code-block-writer";
import {StructurePrinter} from "../StructurePrinter";

export class SpaceFormattingStructuresPrinter<T> extends StructurePrinter<T[]> {
    constructor(writer: CodeBlockWriter, private readonly structurePrinter: StructurePrinter<T>) {
        super(writer);
    }

    printText(structures: T[]) {
        for (let i = 0; i < structures.length; i++) {
            this.writer.conditionalWrite(i > 0, " ");
            this.structurePrinter.printText(structures[i]);
        }
    }
}
