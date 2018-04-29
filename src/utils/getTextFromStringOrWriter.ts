import { CodeBlockWriter } from "../codeBlockWriter";

export function getTextFromStringOrWriter(writer: CodeBlockWriter, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    // note: this should always use a writer to ensure the proper indentation is used
    printTextFromStringOrWriter(writer, textOrWriterFunction);
    return writer.toString();
}

export function printTextFromStringOrWriter(writer: CodeBlockWriter, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    if (typeof textOrWriterFunction === "string")
        writer.write(textOrWriterFunction);
    else
        textOrWriterFunction(writer);
}
