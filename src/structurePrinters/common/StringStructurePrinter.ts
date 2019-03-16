import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterFunction } from "../../types";
import { StructurePrinter } from "../StructurePrinter";

export type StringStructureToTextItem = string | WriterFunction;

export class StringStructurePrinter extends StructurePrinter<StringStructureToTextItem> {
    protected printTextInternal(writer: CodeBlockWriter, textOrWriterFunc: StringStructureToTextItem) {
        if (typeof textOrWriterFunc === "string")
            writer.write(textOrWriterFunc);
        else
            textOrWriterFunc(writer);
    }
}
