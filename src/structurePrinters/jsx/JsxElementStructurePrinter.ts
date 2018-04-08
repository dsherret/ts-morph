import {JsxElementStructure, JsxAttributeStructure} from "../../structures";
import {StructurePrinter} from "../StructurePrinter";
import {JsxAttributeStructurePrinter} from "./JsxAttributeStructurePrinter";

export class JsxElementStructurePrinter extends StructurePrinter<JsxElementStructure> {
    private readonly jsxAttributeStructurePrinter = new JsxAttributeStructurePrinter(this.writer);

    printText(structure: JsxElementStructure) {
        this.writer.write(`<${structure.name}`);
        if (structure.attributes)
            this.printAttributes(structure.attributes);

        if (this.isSelfClosing(structure)) {
            this.writer.write(" />");
            return;
        }
        this.writer.write(">");

        if (structure.children != null)
            this.printChildren(structure.children);

        this.writer.write(`</${structure.name}>`);
    }

    private isSelfClosing(structure: JsxElementStructure) {
        if (structure.isSelfClosing === true)
            return true;
        return structure.isSelfClosing == null && structure.children == null;
    }

    private printAttributes(attributes: JsxAttributeStructure[]) {
        for (const attrib of attributes) {
            this.writer.space();
            this.jsxAttributeStructurePrinter.printText(attrib);
        }
    }

    private printChildren(children: JsxElementStructure[]) {
        this.writer.newLine();
        this.writer.indentBlock(() => {
            for (const child of children) {
                this.printText(child);
                this.writer.newLine();
            }
        });
    }
}
