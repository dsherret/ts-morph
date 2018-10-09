import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { ReturnTypedNodeStructure } from "../../structures";
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

        const typeWriter = this.getNewWriterWithQueuedChildIndentation(writer);
        if (typeof returnType === "string")
            typeWriter.write(returnType);
        else
            returnType(typeWriter);

        const returnTypeText = typeWriter.toString();
        if (!StringUtils.isNullOrWhitespace(returnTypeText))
            writer.write(`: ${returnTypeText}`);
    }
}
