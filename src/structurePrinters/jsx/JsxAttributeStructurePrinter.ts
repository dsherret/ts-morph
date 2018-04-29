import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxAttributeStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class JsxAttributeStructurePrinter extends FactoryStructurePrinter<JsxAttributeStructure> {
    printText(writer: CodeBlockWriter, structure: JsxAttributeStructure) {
        if (structure.isSpreadAttribute)
            writer.write("...");
        writer.write(structure.name);
        if (structure.initializer != null)
            writer.write("=").write(structure.initializer);
    }
}
