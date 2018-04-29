import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinter } from "../StructurePrinter";

export class SpaceFormattingStructuresPrinter<T> extends StructurePrinter<T[]> {
    constructor(private readonly structurePrinter: StructurePrinter<T>) {
        super();
    }

    printText(writer: CodeBlockWriter, structures: T[]) {
        for (let i = 0; i < structures.length; i++) {
            writer.conditionalWrite(i > 0, " ");
            this.structurePrinter.printText(writer, structures[i]);
        }
    }
}
