import {JsxAttributeStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";

export class JsxAttributeStructurePrinter extends StructurePrinter<JsxAttributeStructure> {
    printText(structure: JsxAttributeStructure) {
        if (structure.isSpreadAttribute)
            this.writer.write("...");
        this.writer.write(structure.name);
        if (structure.initializer != null)
            this.writer.write("=").write(structure.initializer);
    }
}
