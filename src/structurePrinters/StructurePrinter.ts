import { CodeBlockWriter } from "../codeBlockWriter";
import { WriterFunction } from "../types";

export abstract class StructurePrinter<TStructure> {
    abstract printText(writer: CodeBlockWriter, structure: TStructure): void;

    // todo: this should not be a method on the base
    protected printTextOrWriterFunc(writer: CodeBlockWriter, textOrWriterFunc: string | WriterFunction | undefined) {
        if (typeof textOrWriterFunc === "string")
            writer.write(textOrWriterFunc);
        else if (textOrWriterFunc != null)
            textOrWriterFunc(writer);
    }
}
