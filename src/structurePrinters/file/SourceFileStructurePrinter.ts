import { CodeBlockWriter } from "../../codeBlockWriter";
import { StructurePrinterFactory } from "../../factories";
import { SourceFileStructure } from "../../structures";
import { ArrayUtils } from "../../utils";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class SourceFileStructurePrinter extends FactoryStructurePrinter<SourceFileStructure> {
    constructor(factory: StructurePrinterFactory, private readonly options: { isAmbient: boolean; }) {
        super(factory);
    }

    printText(writer: CodeBlockWriter, structure: SourceFileStructure) {
        this.factory.forImportDeclaration().printTexts(writer, structure.imports);

        this.factory.forBodyText(this.options).printText(writer, structure);

        this.conditionalBlankLine(writer, structure.exports);
        this.factory.forExportDeclaration().printTexts(writer, structure.exports);

        writer.conditionalNewLine(!writer.isAtStartOfFirstLineOfBlock() && !writer.isLastNewLine());
    }

    private conditionalBlankLine(writer: CodeBlockWriter, structures: any[] | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures))
            writer.conditionalBlankLine(!writer.isAtStartOfFirstLineOfBlock());
    }
}
