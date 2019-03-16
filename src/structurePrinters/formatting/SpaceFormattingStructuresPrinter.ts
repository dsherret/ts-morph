import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinter } from "../StructurePrinter";

export class SpaceFormattingStructuresPrinter<T> extends StructurePrinter<ReadonlyArray<T>> {
    constructor(private readonly printer: StructurePrinter<T>) {
        super();
    }

    printText(writer: CodeBlockWriter, structures: ReadonlyArray<T> | undefined) {
        if (structures == null)
            return;

        super.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structures: ReadonlyArray<T>) {
        for (let i = 0; i < structures.length; i++) {
            writer.conditionalWrite(i > 0, " ");
            this.printer.printText(writer, structures[i]);
        }
    }
}
