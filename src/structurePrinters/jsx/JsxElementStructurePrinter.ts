import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxAttributeStructure, JsxSpreadAttributeStructure, JsxElementStructure } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxElementStructurePrinter extends NodePrinter<JsxElementStructure> {
    protected printTextInternal(writer: CodeBlockWriter, structure: JsxElementStructure) {
        writer.write(`<${structure.name}`);
        if (structure.attributes)
            this.printAttributes(writer, structure.attributes);

        if (this.isSelfClosing(structure)) {
            writer.write(" />");
            return;
        }
        writer.write(">");

        if (structure.children != null)
            this.printChildren(writer, structure.children);

        writer.write(`</${structure.name}>`);
    }

    private isSelfClosing(structure: JsxElementStructure) {
        if (structure.isSelfClosing === true)
            return true;
        return structure.isSelfClosing == null && structure.children == null;
    }

    private printAttributes(writer: CodeBlockWriter, attributes: ReadonlyArray<JsxAttributeStructure | JsxSpreadAttributeStructure>) {
        const attributePrinter = this.factory.forJsxAttributeDecider();
        for (const attrib of attributes) {
            writer.space();
            attributePrinter.printText(writer, attrib);
        }
    }

    private printChildren(writer: CodeBlockWriter, children: ReadonlyArray<JsxElementStructure>) {
        writer.newLine();
        writer.indentBlock(() => {
            for (const child of children) {
                this.printText(writer, child);
                writer.newLine();
            }
        });
    }
}
