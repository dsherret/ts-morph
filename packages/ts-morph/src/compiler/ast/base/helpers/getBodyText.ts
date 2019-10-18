import { CodeBlockWriter } from "../../../../codeBlockWriter";
import { WriterFunction } from "../../../../types";
import { printTextFromStringOrWriter } from "../../../../utils";

/**
 * @internal
 */
export function getBodyText(writer: CodeBlockWriter, textOrWriterFunction: string | WriterFunction) {
    writer.newLineIfLastNot();
    if (typeof textOrWriterFunction !== "string" || textOrWriterFunction.length > 0) {
        writer.indent(() => {
            printTextFromStringOrWriter(writer, textOrWriterFunction);
        });
    }
    writer.newLineIfLastNot();
    writer.write(""); // write last line's indentation
    return writer.toString();
}
