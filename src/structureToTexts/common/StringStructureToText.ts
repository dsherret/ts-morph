import CodeBlockWriter from "code-block-writer";
import {StructureToText} from "../StructureToText";

export type StringStructureToTextItem = string | ((writer: CodeBlockWriter) => void);

export class StringStructureToText extends StructureToText<StringStructureToTextItem> {
    constructor(writer: CodeBlockWriter) {
        super(writer);
    }

    writeText(textOrWriterFunc: StringStructureToTextItem) {
        if (typeof textOrWriterFunc === "string")
            this.writer.write(textOrWriterFunc);
        else
            textOrWriterFunc(this.writer);
    }
}
