import CodeBlockWriter from "code-block-writer";

export abstract class StructureToText<TStructure> {
    constructor(protected readonly writer: CodeBlockWriter) {
    }

    abstract writeText(structure: TStructure): void;

    protected writeTextOrWriterFunc(textOrWriterFunc: string | ((writer: CodeBlockWriter) => void) | undefined, writer = this.writer) {
        if (typeof textOrWriterFunc === "string")
            writer.write(textOrWriterFunc);
        else if (textOrWriterFunc != null)
            textOrWriterFunc(writer);
    }
}
