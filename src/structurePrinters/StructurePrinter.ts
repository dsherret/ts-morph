import CodeBlockWriter from "code-block-writer";

export abstract class StructurePrinter<TStructure> {
    constructor(protected readonly writer: CodeBlockWriter) {
    }

    abstract printText(structure: TStructure): void;

    protected printTextOrWriterFunc(textOrWriterFunc: string | ((writer: CodeBlockWriter) => void) | undefined, writer = this.writer) {
        if (typeof textOrWriterFunc === "string")
            writer.write(textOrWriterFunc);
        else if (textOrWriterFunc != null)
            textOrWriterFunc(writer);
    }
}
