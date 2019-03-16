import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxAttributeStructure, JsxSpreadAttributeStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class JsxAttributeDeciderStructurePrinter extends FactoryStructurePrinter<JsxAttributeStructure | JsxSpreadAttributeStructure> {
    protected printTextInternal(writer: CodeBlockWriter, structure: JsxAttributeStructure | JsxSpreadAttributeStructure) {
        if (structure.isSpreadAttribute)
            this.factory.forJsxSpreadAttribute().printText(writer, structure);
        else
            this.factory.forJsxAttribute().printText(writer, structure);
    }
}
