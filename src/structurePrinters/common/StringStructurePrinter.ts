import CodeBlockWriter from "code-block-writer";
import {StructurePrinter} from "../StructurePrinter";

export type StringStructureToTextItem = string | ((writer: CodeBlockWriter) => void);

export class StringStructurePrinter extends StructurePrinter<StringStructureToTextItem> {
    constructor(writer: CodeBlockWriter) {
        super(writer);
    }

    printText(textOrWriterFunc: StringStructureToTextItem) {
        if (typeof textOrWriterFunc === "string")
            this.writer.write(textOrWriterFunc);
        else
            textOrWriterFunc(this.writer);
    }
}
