import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterFunction } from "../../types";
import { Printer } from "../Printer";

export type StringStructureToTextItem = string | WriterFunction;

export class StringStructurePrinter extends Printer<StringStructureToTextItem> {
    printText(writer: CodeBlockWriter, textOrWriterFunc: StringStructureToTextItem) {
        if (typeof textOrWriterFunc === "string")
            writer.write(textOrWriterFunc);
        else
            textOrWriterFunc(writer);
    }
}
