import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { SourceFileStructure } from "../../structures";
import { NodePrinter } from "../NodePrinter";

export class SourceFileStructurePrinter extends NodePrinter<SourceFileStructure> {
    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: SourceFileStructure) {
        this.factory.forStatementedNode(this.options).printText(writer, structure);

        writer.conditionalNewLine(!writer.isAtStartOfFirstLineOfBlock() && !writer.isLastNewLine());
    }
}
