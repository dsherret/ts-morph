import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { TypedNodeStructure } from "../../structures";
import { WriterFunction } from "../../types";
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

        // todo: hacky, will need to change this in the future...
        const initializerText = typeof type === "string" ? type : getTextForWriterFunc(type);
        if (!StringUtils.isNullOrWhitespace(initializerText))
            writer.write(`${this.separator} ${initializerText}`);

        function getTextForWriterFunc(writerFunc: WriterFunction) {
            const newWriter = new CodeBlockWriter(writer.getOptions());
            writerFunc(newWriter);
            return newWriter.toString();
        }
    }
}
