import { CodeBlockWriter } from "../../codeBlockWriter";
import { InitializerSetExpressionableNodeStructure } from "../../structures";
import { WriterFunction } from "../../types";
import { StringUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class InitializerExpressionableNodeStructurePrinter extends FactoryStructurePrinter<InitializerSetExpressionableNodeStructure> {
    printText(writer: CodeBlockWriter, structure: InitializerSetExpressionableNodeStructure) {
        const { initializer } = structure;
        if (initializer == null)
            return;

        // todo: hacky, will need to change this in the future...
        const initializerText = typeof initializer === "string" ? initializer : getTextForWriterFunc(initializer);
        if (!StringUtils.isNullOrWhitespace(initializerText))
            writer.write(` = ${initializerText}`);

        function getTextForWriterFunc(writerFunc: WriterFunction) {
            const newWriter = new CodeBlockWriter(writer.getOptions());
            writerFunc(newWriter);
            return newWriter.toString();
        }
    }
}
