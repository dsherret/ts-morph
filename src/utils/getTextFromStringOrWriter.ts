import { CodeBlockWriter } from "../codeBlockWriter";
import { WriterFunction } from "../types";

export function getTextFromStringOrWriter(writer: CodeBlockWriter, textOrWriterFunction: string | WriterFunction) {
    // note: this should always use a writer to ensure the proper indentation is used
    printTextFromStringOrWriter(writer, textOrWriterFunction);
    return writer.toString();
}

export function printTextFromStringOrWriter(writer: CodeBlockWriter, textOrWriterFunction: string | WriterFunction) {
    if (typeof textOrWriterFunction === "string")
        writer.write(textOrWriterFunction);
    else
        textOrWriterFunction(writer);
}
