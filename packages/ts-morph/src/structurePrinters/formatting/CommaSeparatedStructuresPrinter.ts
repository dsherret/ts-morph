import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterFunction } from "../../types";
import { WriterUtils } from "../../utils";
import { Printer } from "../Printer";
import { getAppendCommaPos } from "../../manipulation/helpers/appendCommaToText";

export class CommaSeparatedStructuresPrinter<T> extends Printer<ReadonlyArray<T | WriterFunction | string> | WriterFunction | string> {
    constructor(private readonly printer: Printer<T | WriterFunction>) {
        super();
    }

    printText(writer: CodeBlockWriter, structures: ReadonlyArray<T | WriterFunction | string> | WriterFunction | string | undefined) {
        printTextWithSeparator(this.printer, writer, structures, () => writer.spaceIfLastNot());
    }
}

export function printTextWithSeparator<T>(
    printer: Printer<T | WriterFunction | string>,
    writer: CodeBlockWriter,
    structures: ReadonlyArray<T | WriterFunction | string> | WriterFunction | string | undefined,
    separator: () => void
) {
    if (structures == null)
        return;

    if (structures instanceof Function || typeof structures === "string")
        printer.printText(writer, structures);
    else {
        // insert all the texts first
        const commaAppendPositions: (number | false)[] = new Array(structures.length);
        for (let i = 0; i < structures.length; i++) {
            if (i > 0)
                separator();
            const structure = structures[i];
            const startPos = writer.getLength();
            printer.printText(writer, structure);

            // collect the comma append position for this text
            const pos = getAppendCommaPos(WriterUtils.getLastCharactersToPos(writer, startPos));
            commaAppendPositions[i] = pos === -1 ? false : pos + startPos;
        }

        // now insert the commas as necessary
        let foundFirst = false;
        for (let i = commaAppendPositions.length - 1; i >= 0; i--) {
            const pos = commaAppendPositions[i];
            if (pos === false)
                continue;
            else if (!foundFirst)
                foundFirst = true;
            else
                writer.unsafeInsert(pos, ",");
        }
    }
}
