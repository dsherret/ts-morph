import { CodeBlockWriter } from "../../codeBlockWriter";
import { JSDocStructure } from "../../structures";
import { WriterFunction } from "../../types";
import { getTextFromStringOrWriter } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class JSDocStructurePrinter extends FactoryStructurePrinter<JSDocStructure | string> {
    printText(writer: CodeBlockWriter, structure: JSDocStructure | string | WriterFunction) {
        const lines = getText().split(/\r?\n/);
        writer.writeLine("/**");
        for (const line of lines)
            writer.writeLine(` * ${line}`);
        writer.write(" */");

        function getText() {
            if (typeof structure === "string")
                return structure;
            const tempWriter = new CodeBlockWriter(writer.getOptions());
            if (typeof structure === "function") {
                structure(tempWriter);
                return tempWriter.toString();
            }
            return getTextFromStringOrWriter(tempWriter, structure.description);
        }
    }

    printDocs(writer: CodeBlockWriter, structures: (JSDocStructure | string | WriterFunction)[] | undefined) {
        if (structures == null)
            return;

        for (const structure of structures) {
            this.printText(writer, structure);
            writer.newLine();
        }
    }
}
