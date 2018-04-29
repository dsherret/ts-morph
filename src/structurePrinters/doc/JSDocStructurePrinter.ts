import { CodeBlockWriter } from "../../codeBlockWriter";
import { JSDocStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class JSDocStructurePrinter extends FactoryStructurePrinter<JSDocStructure | string> {
    printText(writer: CodeBlockWriter, structure: JSDocStructure | string) {
        const lines = getText().split(/\r?\n/);
        writer.writeLine("/**");
        for (const line of lines)
            writer.writeLine(` * ${line}`);
        writer.write(" */");

        function getText() {
            if (typeof structure === "string")
                return structure;
            return structure.description;
        }
    }

    printDocs(writer: CodeBlockWriter, structures: (JSDocStructure | string)[] | undefined) {
        if (structures == null)
            return;

        for (const structure of structures) {
            this.printText(writer, structure);
            writer.newLine();
        }
    }
}
