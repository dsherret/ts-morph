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

        const typeWriter = this.getNewWriterWithQueuedChildIndentation(writer);
        if (typeof type === "string")
            typeWriter.write(type);
        else
            type(typeWriter);

        const typeText = typeWriter.toString();
        if (!StringUtils.isNullOrWhitespace(typeText))
            writer.write(`${this.separator} ${typeText}`);
    }
}
