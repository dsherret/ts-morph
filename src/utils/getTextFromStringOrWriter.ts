import CodeBlockWriter from "code-block-writer";

export function getTextFromStringOrWriter(writer: CodeBlockWriter, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    writeTextFromStringOrWriter(writer, textOrWriterFunction);
    return writer.toString();
}

export function writeTextFromStringOrWriter(writer: CodeBlockWriter, textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
    if (typeof textOrWriterFunction === "string")
        writer.write(textOrWriterFunction);
    else
        textOrWriterFunction(writer);
}
