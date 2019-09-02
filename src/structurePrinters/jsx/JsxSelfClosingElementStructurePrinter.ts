import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxAttributeStructure, JsxSpreadAttributeStructure, JsxSelfClosingElementStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxSelfClosingElementStructurePrinter extends NodePrinter<OptionalKind<JsxSelfClosingElementStructure>> {
    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<JsxSelfClosingElementStructure>) {
        writer.hangingIndent(() => {
            writer.write(`<${structure.name}`);
            if (structure.attributes)
                this.printAttributes(writer, structure.attributes);

            writer.write(" />");
        });
    }

    private printAttributes(writer: CodeBlockWriter, attributes: ReadonlyArray<OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure>) {
        const attributePrinter = this.factory.forJsxAttributeDecider();
        for (const attrib of attributes) {
            writer.space();
            attributePrinter.printText(writer, attrib);
        }
    }
}
