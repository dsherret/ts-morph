import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinter } from "../StructurePrinter";

export class CommaSeparatedStructuresPrinter<T> extends StructurePrinter<T[]> {
    constructor(private readonly structurePrinter: StructurePrinter<T>) {
        super();
    }

    printText(writer: CodeBlockWriter, structures: T[] | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                writer.write(", ");
            this.structurePrinter.printText(writer, structures[i]);
        }
    }
}
