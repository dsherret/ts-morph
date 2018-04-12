import CodeBlockWriter from "code-block-writer";
import {JsxElementStructure, JsxAttributeStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {JsxAttributeStructurePrinter} from "./JsxAttributeStructurePrinter";

export class JsxElementStructurePrinter extends StructurePrinter<JsxElementStructure> {
    private readonly jsxAttributeStructurePrinter = new JsxAttributeStructurePrinter();

    printText(writer: CodeBlockWriter, structure: JsxElementStructure) {
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

    private printAttributes(writer: CodeBlockWriter, attributes: JsxAttributeStructure[]) {
        for (const attrib of attributes) {
            writer.space();
            this.jsxAttributeStructurePrinter.printText(writer, attrib);
        }
    }

    private printChildren(writer: CodeBlockWriter, children: JsxElementStructure[]) {
        writer.newLine();
        writer.indentBlock(() => {
            for (const child of children) {
                this.printText(writer, child);
                writer.newLine();
            }
        });
    }
}
