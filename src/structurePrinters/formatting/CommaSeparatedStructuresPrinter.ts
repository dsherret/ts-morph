import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterFunction } from "../../types";
import { Printer } from "../Printer";

export class CommaSeparatedStructuresPrinter<T> extends Printer<ReadonlyArray<T | WriterFunction> | WriterFunction> {
    constructor(private readonly printer: Printer<T | WriterFunction>) {
        super();
    }

    printText(writer: CodeBlockWriter, structures: ReadonlyArray<T | WriterFunction> | WriterFunction | undefined) {
        if (structures == null)
            return;

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
