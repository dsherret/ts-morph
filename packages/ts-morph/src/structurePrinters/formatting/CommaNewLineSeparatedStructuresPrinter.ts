import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterFunction } from "../../types";
import { Printer } from "../Printer";
import { printTextWithSeparator } from "./CommaSeparatedStructuresPrinter";

export class CommaNewLineSeparatedStructuresPrinter<T> extends Printer<ReadonlyArray<T | WriterFunction | string> | WriterFunction | string> {
    constructor(private readonly printer: Printer<T | WriterFunction>) {
        super();
    }

    printText(writer: CodeBlockWriter, structures: ReadonlyArray<T | WriterFunction | string> | WriterFunction | string | undefined) {
        printTextWithSeparator(this.printer, writer, structures, () => writer.newLineIfLastNot());
    }
}
