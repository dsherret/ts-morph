import { CodeBlockWriter } from "../../codeBlockWriter";
import { ReturnTypedNodeStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { StructurePrinter } from "../StructurePrinter";

export class ReturnTypedNodeStructurePrinter extends StructurePrinter<ReturnTypedNodeStructure> {
    constructor(private readonly alwaysWrite = false) {
        super();
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: ReturnTypedNodeStructure) {
        let { returnType } = structure;
        if (returnType == null && this.alwaysWrite === false)
            return;

        returnType = returnType || "void";

        const returnTypeText = this.getTextWithQueuedChildIndentation(writer, returnType);
        if (!StringUtils.isNullOrWhitespace(returnTypeText))
            writer.write(`: ${returnTypeText}`);
    }
}
