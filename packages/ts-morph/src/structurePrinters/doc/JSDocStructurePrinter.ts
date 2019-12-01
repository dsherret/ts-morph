import { CodeBlockWriter } from "../../codeBlockWriter";
import { JSDocStructure, OptionalKind } from "../../structures";
import { WriterFunction } from "../../types";
import { printTextFromStringOrWriter } from "../../utils";
import { NodePrinter } from "../NodePrinter";

export class JSDocStructurePrinter extends NodePrinter<OptionalKind<JSDocStructure> | string | WriterFunction> {
    printDocs(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<JSDocStructure> | string | WriterFunction> | undefined) {
        if (structures == null)
            return;

        for (const structure of structures) {
            this.printText(writer, structure);
            writer.newLine();
        }
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<JSDocStructure> | string | WriterFunction) {
        const text = getText(this);
        const lines = text.split(/\r?\n/);
        const startsWithNewLine = lines[0].length === 0;
        const isSingleLine = lines.length <= 1;
        const startIndex = startsWithNewLine ? 1 : 0;

        writer.write("/**");

        if (isSingleLine)
            writer.space();
        else
            writer.newLine();

        if (isSingleLine)
            writer.write(lines[startIndex]);
        else {
            for (let i = startIndex; i < lines.length; i++) {
                writer.write(` *`);

                if (lines[i].length > 0)
                    writer.write(` ${lines[i]}`);

                writer.newLine();
            }
        }

        writer.spaceIfLastNot();
        writer.write("*/");

        function getText(jsdocPrinter: JSDocStructurePrinter) {
            if (typeof structure === "string")
                return structure;
            const tempWriter = jsdocPrinter.getNewWriter(writer);
            if (typeof structure === "function")
                structure(tempWriter);
            else {
                if (structure.description)
                    printTextFromStringOrWriter(tempWriter, structure.description);
                if (structure.tags && structure.tags.length > 0) {
                    if (tempWriter.getLength() > 0)
                        tempWriter.newLineIfLastNot();
                    jsdocPrinter.factory.forJSDocTag({ printStarsOnNewLine: false }).printTags(tempWriter, structure.tags);
                }
            }
            return tempWriter.toString();
        }
    }
}
