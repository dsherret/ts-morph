import CodeBlockWriter from "code-block-writer";

export function getTextFromStringOrWriter(writer: CodeBlockWriter, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    printTextFromStringOrWriter(writer, textOrWriterFunction);
    return writer.toString();
}

export function printTextFromStringOrWriter(writer: CodeBlockWriter, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    if (typeof textOrWriterFunction === "string")
        writer.write(textOrWriterFunction);
    else
        textOrWriterFunction(writer);
}
