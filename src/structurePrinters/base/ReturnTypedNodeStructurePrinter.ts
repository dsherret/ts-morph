import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { ReturnTypedNodeStructure } from "../../structures";
import { WriterFunction } from "../../types";
import { StringUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class ReturnTypedNodeStructurePrinter extends FactoryStructurePrinter<ReturnTypedNodeStructure> {
    constructor(factory: StructurePrinterFactory, private readonly alwaysWrite = false) {
        super(factory);
    }

    printText(writer: CodeBlockWriter, structure: ReturnTypedNodeStructure) {
        let { returnType } = structure;
        if (returnType == null && this.alwaysWrite === false)
            return;

        returnType = returnType || "void";

        // todo: hacky, will need to change this in the future...
        const initializerText = typeof returnType === "string" ? returnType : getTextForWriterFunc(returnType);
        if (!StringUtils.isNullOrWhitespace(initializerText))
            writer.write(`: ${initializerText}`);

        function getTextForWriterFunc(writerFunc: WriterFunction) {
            const newWriter = new CodeBlockWriter(writer.getOptions());
            writerFunc(newWriter);
            return newWriter.toString();
        }
    }
}
