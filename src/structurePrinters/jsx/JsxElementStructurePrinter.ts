import { CodeBlockWriter } from "../../codeBlockWriter";
import { JsxAttributeStructure, JsxSpreadAttributeStructure, JsxElementStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class JsxElementStructurePrinter extends NodePrinter<OptionalKind<JsxElementStructure>> {
    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<JsxElementStructure>) {
        writer.hangingIndent(() => {
            writer.write(`<${structure.name}`);
            if (structure.attributes)
                this.printAttributes(writer, structure.attributes);
            writer.write(">");
        });

        this.printChildren(writer, structure.children);

        writer.write(`</${structure.name}>`);
    }

    private printAttributes(writer: CodeBlockWriter, attributes: ReadonlyArray<OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure>) {
        const attributePrinter = this.factory.forJsxAttributeDecider();
        for (const attrib of attributes) {
            writer.space();
            attributePrinter.printText(writer, attrib);
        }
    }

    private printChildren(writer: CodeBlockWriter, children: JsxElementStructure["children"]) {
        if (children == null)
            return;

        writer.newLine();
        writer.indent(() => {
            for (const child of children) {
                this.factory.forJsxChildDecider().printText(writer, child);
                writer.newLine();
            }
        });
    }
}
