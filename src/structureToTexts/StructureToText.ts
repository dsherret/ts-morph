import CodeBlockWriter from "code-block-writer";

export abstract class StructureToText<TStructure> {
    constructor(protected readonly writer: CodeBlockWriter) {
    }

    abstract writeText(structure: TStructure): void;

    protected writeTextOrWriterFunc(textOrWriterFunc: string | ((writer: CodeBlockWriter) => void) | undefined) {
        if (typeof textOrWriterFunc === "string")
            this.writer.write(textOrWriterFunc);
        else if (textOrWriterFunc != null)
            textOrWriterFunc(this.writer);
    }
}
