import { CodeBlockWriter } from "../../codeBlockWriter";
import { getAppendCommaPos } from "../../manipulation/helpers/appendCommaToText";
import { WriterFunction } from "../../types";
import { Printer } from "../Printer";
import { NodePrinter } from "../NodePrinter";

export class CommaNewLineSeparatedStructuresPrinter<T> extends Printer<ReadonlyArray<T | WriterFunction> | WriterFunction> {
    private readonly _nodePrinter: NodePrinter<T | WriterFunction> | undefined;

    constructor(private readonly printer: Printer<T | WriterFunction>) {
        super();
        this._nodePrinter = printer instanceof NodePrinter ? printer : undefined;
    }

    printText(writer: CodeBlockWriter, structures: ReadonlyArray<T | WriterFunction> | WriterFunction | undefined) {
        if (structures == null)
            return;

        if (structures instanceof Function)
            this.printer.printText(writer, structures);
        else {
            for (let i = 0; i < structures.length; i++) {
                const structure = structures[i];
                const isLast = i === structures.length - 1;
                const startPos = writer.getLength();

                if (this._nodePrinter != null && !(structure instanceof Function)) {
                    this._nodePrinter.printLeadingTrivia(writer, structure);
                    this._nodePrinter.printTextWithoutTrivia(writer, structure);
                    if (!isLast)
                        writer.write(",");
                    this._nodePrinter.printTrailingTrivia(writer, structure);

                    if (!isLast) {
                        writer.closeComment();
                        if (!writer.isAtStartOfFirstLineOfBlock())
                            writer.newLineIfLastNot();
                    }
                }
                else {
                    this.printer.printText(writer, structure);
                    if (!isLast) {
                        const appendPos = getAppendCommaPos(writer.toString(), startPos);
                        if (appendPos === writer.getLength())
                            writer.write(",");
                        writer.newLineIfLastNot();
                    }
                }
            }
        }
    }
}
