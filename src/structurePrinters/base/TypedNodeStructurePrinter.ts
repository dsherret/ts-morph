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

        const initializerWriter = this.getNewWriterWithQueuedChildIndentation(writer);
        if (typeof type === "string")
            initializerWriter.write(type);
        else
            type(initializerWriter);

        const initializerText = initializerWriter.toString();
        if (!StringUtils.isNullOrWhitespace(initializerText))
            writer.write(`${this.separator} ${initializerText}`);
    }
}
