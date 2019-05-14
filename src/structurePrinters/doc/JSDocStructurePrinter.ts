import { CodeBlockWriter } from "../../codeBlockWriter";
import { JSDocStructure, OptionalKind } from "../../structures";
import { WriterFunction } from "../../types";
import { getTextFromStringOrWriter } from "../../utils";
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
        const lines = getText.call(this).split(/\r?\n/);
        writer.writeLine("/**");
        for (const line of lines) {
            writer.write(` *`);
            if (line.length > 0)
                writer.write(` ${line}`);
            writer.newLine();
        }
        writer.write(" */");

        function getText(this: JSDocStructurePrinter) {
            if (typeof structure === "string")
                return structure;
            const tempWriter = this.getNewWriter(writer);
            if (typeof structure === "function") {
                structure(tempWriter);
                return tempWriter.toString();
            }
            return getTextFromStringOrWriter(tempWriter, structure.description);
        }
    }
}
