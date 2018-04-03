import {JsxElementStructure, JsxAttributeStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {JsxAttributeStructureToText} from "./JsxAttributeStructureToText";

export class JsxElementStructureToText extends StructureToText<JsxElementStructure> {
    private readonly jsxAttributeStructureToText = new JsxAttributeStructureToText(this.writer);

    writeText(structure: JsxElementStructure) {
        this.writer.write(`<${structure.name}`);
        if (structure.attributes)
            this.writeAttributes(structure.attributes);

        if (this.isSelfClosing(structure)) {
            this.writer.write(" />");
            return;
        }
        this.writer.write(">");

        if (structure.children != null)
            this.writeChildren(structure.children);

        this.writer.write(`</${structure.name}>`);
    }

    private isSelfClosing(structure: JsxElementStructure) {
        if (structure.isSelfClosing === true)
            return true;
        return structure.isSelfClosing == null && structure.children == null;
    }

    private writeAttributes(attributes: JsxAttributeStructure[]) {
        for (const attrib of attributes) {
            this.writer.space();
            this.jsxAttributeStructureToText.writeText(attrib);
        }
    }

    private writeChildren(children: JsxElementStructure[]) {
        this.writer.newLine();
        this.writer.indentBlock(() => {
            for (const child of children) {
                this.writeText(child);
                this.writer.newLine();
            }
        });
    }
}
