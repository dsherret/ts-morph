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

    protected getNewWriter(writer: CodeBlockWriter) {
        return new CodeBlockWriter(writer.getOptions());
    }

    protected getNewWriterWithQueuedChildIndentation(writer: CodeBlockWriter) {
        const newWriter = new CodeBlockWriter(writer.getOptions());
        newWriter.queueIndentationLevel(1);
        return newWriter;
    }

    protected getTextWithQueuedChildIndentation(writer: CodeBlockWriter, textOrWriterFunc: string | WriterFunction) {
        const queuedChildIndentationWriter = this.getNewWriterWithQueuedChildIndentation(writer);
        if (typeof textOrWriterFunc === "string")
            queuedChildIndentationWriter.write(textOrWriterFunc);
        else
            textOrWriterFunc(queuedChildIndentationWriter);
        return queuedChildIndentationWriter.toString();
    }
}
