import { CodeBlockWriter } from "../../codeBlockWriter";
import { InitializerExpressionableNodeStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class InitializerExpressionableNodeStructurePrinter extends FactoryStructurePrinter<InitializerExpressionableNodeStructure> {
    printText(writer: CodeBlockWriter, structure: InitializerExpressionableNodeStructure) {
        const { initializer } = structure;
        if (initializer == null)
            return;

        const initializerText = this.getTextWithQueuedChildIndentation(writer, initializer);
        if (!StringUtils.isNullOrWhitespace(initializerText))
            writer.write(` = ${initializerText}`);
    }
}
