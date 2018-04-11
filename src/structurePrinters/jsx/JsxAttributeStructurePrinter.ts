import CodeBlockWriter from "code-block-writer";
﻿import {JsxAttributeStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";

export class JsxAttributeStructurePrinter extends StructurePrinter<JsxAttributeStructure> {
    printText(writer: CodeBlockWriter, structure: JsxAttributeStructure) {
        if (structure.isSpreadAttribute)
            writer.write("...");
        writer.write(structure.name);
        if (structure.initializer != null)
            writer.write("=").write(structure.initializer);
    }
}
