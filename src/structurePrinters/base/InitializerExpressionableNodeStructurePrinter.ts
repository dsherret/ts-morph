import { CodeBlockWriter } from "../../codeBlockWriter";
import { InitializerExpressionableNodeStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { StructurePrinter } from "../StructurePrinter";

export class InitializerExpressionableNodeStructurePrinter extends StructurePrinter<InitializerExpressionableNodeStructure> {
    protected printTextInternal(writer: CodeBlockWriter, structure: InitializerExpressionableNodeStructure) {
        const { initializer } = structure;
        if (initializer == null)
            return;

        const initializerText = this.getTextWithQueuedChildIndentation(writer, initializer);
        if (!StringUtils.isNullOrWhitespace(initializerText))
            writer.write(` = ${initializerText}`);
    }
}
