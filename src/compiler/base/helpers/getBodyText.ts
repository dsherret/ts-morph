import CodeBlockWriter from "code-block-writer";
import {printTextFromStringOrWriter} from "../../../utils";
import {Node} from "../../common";

/**
 * @internal
 */
export function getBodyText(writer: CodeBlockWriter, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    writer.newLineIfLastNot();
    if (typeof textOrWriterFunction !== "string" || textOrWriterFunction.length > 0)
        writer.indentBlock(() => {
            printTextFromStringOrWriter(writer, textOrWriterFunction);
        });
    writer.newLineIfLastNot();
    writer.write(""); // write last line's indentation
    return writer.toString();
}
