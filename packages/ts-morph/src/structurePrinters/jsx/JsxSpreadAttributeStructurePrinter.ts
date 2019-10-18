import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxSpreadAttributeStructure } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxSpreadAttributeStructurePrinter extends NodePrinter<JsxSpreadAttributeStructure> {
    protected printTextInternal(writer: CodeBlockWriter, structure: JsxSpreadAttributeStructure) {
        writer.hangingIndent(() => {
            writer.write("...");
            writer.write(structure.expression);
        });
    }
}
