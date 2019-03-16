import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterFunction } from "../../types";
import { StructurePrinter } from "../StructurePrinter";

export class CommaSeparatedStructuresPrinter<T> extends StructurePrinter<ReadonlyArray<T | WriterFunction> | WriterFunction> {
    constructor(private readonly printer: StructurePrinter<T | WriterFunction>) {
        super();
    }

    printText(writer: CodeBlockWriter, structures: ReadonlyArray<T | WriterFunction> | WriterFunction | undefined) {
        if (structures == null)
            return;

        super.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structures: ReadonlyArray<T | WriterFunction> | WriterFunction) {
        if (structures instanceof Function)
            this.printer.printText(writer, structures);
        else
            for (let i = 0; i < structures.length; i++) {
                if (i > 0)
                    writer.write(", ");
                this.printer.printText(writer, structures[i]);
            }
    }
}
