import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { TypedNodeStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class TypedNodeStructurePrinter extends FactoryStructurePrinter<TypedNodeStructure> {
    constructor(factory: StructurePrinterFactory, private readonly separator: string, private readonly alwaysWrite = false) {
        super(factory);
    }

    printText(writer: CodeBlockWriter, structure: TypedNodeStructure) {
        let { type } = structure;
        if (type == null && this.alwaysWrite === false)
            return;

        type = type || "any";

        const typeText = this.getTextWithQueuedChildIndentation(writer, type);
        if (!StringUtils.isNullOrWhitespace(typeText))
            writer.write(`${this.separator} ${typeText}`);
    }
}
