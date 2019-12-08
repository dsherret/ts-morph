import { CodeBlockWriter } from "../../codeBlockWriter";
import { JSDocTagStructure, OptionalKind } from "../../structures";
import { WriterFunction } from "../../types";
import { printTextFromStringOrWriter } from "../../utils";
import { NodePrinter } from "../NodePrinter";
import { StructurePrinterFactory } from "../../factories";
import { StringUtils } from "@ts-morph/common";

export class JSDocTagStructurePrinter extends NodePrinter<OptionalKind<JSDocTagStructure> | string | WriterFunction> {
    constructor(factory: StructurePrinterFactory, private readonly options: { printStarsOnNewLine: boolean; }) {
        super(factory);
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<JSDocTagStructure> | string | WriterFunction> | undefined) {
        if (structures == null)
            return;

        for (let i = 0; i < structures.length; i++) {
            if (i > 0) {
                writer.newLine();
                writer.conditionalWrite(this.options.printStarsOnNewLine, " * ");
            }

            this.printText(writer, structures[i]);
        }
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<JSDocTagStructure> | string | WriterFunction) {
        const text = getText(this);
        const lines = text.split(/\r?\n/);

        for (let i = 0; i < lines.length; i++) {
            if (i > 0) {
                writer.newLine();
                if (this.options.printStarsOnNewLine)
                    writer.write(` *`);
            }

            if (lines[i].length > 0) {
                if (this.options.printStarsOnNewLine && i > 0)
                    writer.space();

                writer.write(lines[i]);
            }
        }

        function getText(tagPrinter: JSDocTagStructurePrinter) {
            if (typeof structure === "string")
                return structure;
            const tempWriter = tagPrinter.getNewWriter(writer);
            if (typeof structure === "function")
                structure(tempWriter);
            else {
                if (structure.text)
                    printTextFromStringOrWriter(tempWriter, structure.text);
                const currentText = tempWriter.toString();
                tempWriter.unsafeInsert(0, `@${structure.tagName}` + (currentText.length > 0 && !StringUtils.startsWithNewLine(currentText) ? " " : ""));
            }

            return tempWriter.toString();
        }
    }
}
