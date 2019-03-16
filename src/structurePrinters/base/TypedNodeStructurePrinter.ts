import { CodeBlockWriter } from "../../codeBlockWriter";
import { TypedNodeStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { StructurePrinter } from "../StructurePrinter";

export class TypedNodeStructurePrinter extends StructurePrinter<TypedNodeStructure> {
    constructor(private readonly separator: string, private readonly alwaysWrite = false) {
        super();
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: TypedNodeStructure) {
        let { type } = structure;
        if (type == null && this.alwaysWrite === false)
            return;

        type = type || "any";

        const typeText = this.getTextWithQueuedChildIndentation(writer, type);
        if (!StringUtils.isNullOrWhitespace(typeText))
            writer.write(`${this.separator} ${typeText}`);
    }
}
