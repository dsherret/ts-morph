import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterFunction } from "../../types";
import { StructurePrinter } from "../StructurePrinter";

export class CommaSeparatedStructuresPrinter<T> extends StructurePrinter<T[] | WriterFunction> {
    constructor(private readonly structurePrinter: StructurePrinter<T | WriterFunction>) {
        super();
    }

    printText(writer: CodeBlockWriter, structures: ReadonlyArray<T | WriterFunction> | WriterFunction | undefined) {
        if (structures == null)
            return;

        if (structures instanceof Function)
            this.structurePrinter.printText(writer, structures);
        else
            for (let i = 0; i < structures.length; i++) {
                if (i > 0)
                    writer.write(", ");
                this.structurePrinter.printText(writer, structures[i]);
            }
    }
}
