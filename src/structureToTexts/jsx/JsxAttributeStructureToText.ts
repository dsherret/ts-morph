import {JsxAttributeStructure} from "./../../structures";
import {StructureToText} from "./../StructureToText";

export class JsxAttributeStructureToText extends StructureToText<JsxAttributeStructure> {
    writeText(structure: JsxAttributeStructure) {
        if (structure.isSpreadAttribute)
            this.writer.write("...");
        this.writer.write(structure.name);
        if (structure.initializer != null)
            this.writer.write("=").write(structure.initializer);
    }
}
