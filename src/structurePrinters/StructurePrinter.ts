import { CodeBlockWriter } from "../codeBlockWriter";

export abstract class StructurePrinter<TStructure> {
    abstract printText(writer: CodeBlockWriter, structure: TStructure): void;

    // todo: this should not be a method on the base
    protected printTextOrWriterFunc(writer: CodeBlockWriter, textOrWriterFunc: string | ((writer: CodeBlockWriter) => void) | undefined) {
        if (typeof textOrWriterFunc === "string")
            writer.write(textOrWriterFunc);
        else if (textOrWriterFunc != null)
            textOrWriterFunc(writer);
    }
}
