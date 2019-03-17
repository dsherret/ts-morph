﻿import { CodeBlockWriter } from "../../codeBlockWriter";
import { InitializerExpressionableNodeStructure } from "../../structures";
import { StringUtils } from "../../utils";
import { Printer } from "../Printer";

export class InitializerExpressionableNodeStructurePrinter extends Printer<InitializerExpressionableNodeStructure> {
    printText(writer: CodeBlockWriter, structure: InitializerExpressionableNodeStructure) {
        const { initializer } = structure;
        if (initializer == null)
            return;

        const initializerText = this.getTextWithQueuedChildIndentation(writer, initializer);
        if (!StringUtils.isNullOrWhitespace(initializerText))
            writer.write(` = ${initializerText}`);
    }
}
