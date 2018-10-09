﻿import { CodeBlockWriter } from "../../codeBlockWriter";
import { InitializerSetExpressionableNodeStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class InitializerExpressionableNodeStructurePrinter extends FactoryStructurePrinter<InitializerSetExpressionableNodeStructure> {
    printText(writer: CodeBlockWriter, structure: InitializerSetExpressionableNodeStructure) {
        const { initializer } = structure;
        if (initializer == null)
            return;

        const initializerText = this.getTextWithQueuedChildIndentation(writer, initializer);
        if (!StringUtils.isNullOrWhitespace(initializerText))
            writer.write(` = ${initializerText}`);
    }
}
