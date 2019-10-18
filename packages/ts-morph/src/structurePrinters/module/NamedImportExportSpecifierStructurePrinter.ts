import { StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { WriterFunction } from "../../types";
import { ExportSpecifierStructure, ImportSpecifierStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export type NamedImportExportSpecifierStructureToTextItem = WriterFunction | OptionalKind<ImportSpecifierStructure> | OptionalKind<ExportSpecifierStructure>
    | string;

export class NamedImportExportSpecifierStructurePrinter extends NodePrinter<NamedImportExportSpecifierStructureToTextItem> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTextsWithBraces(writer: CodeBlockWriter, structures: ReadonlyArray<NamedImportExportSpecifierStructureToTextItem> | WriterFunction) {
        const formatSettings = this.factory.getFormatCodeSettings();
        writer.write("{");
        const specifierWriter = this.getNewWriter(writer);
        this.printTexts(specifierWriter, structures);
        const specifierText = specifierWriter.toString();
        if (formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces && !StringUtils.startsWithNewLine(specifierText))
            writer.space();
        writer.write(specifierText);
        if (formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces && !StringUtils.endsWithNewLine(specifierText))
            writer.space();
        writer.write("}");
    }

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<NamedImportExportSpecifierStructureToTextItem> | WriterFunction) {
        if (structures instanceof Function)
            this.printText(writer, structures);
        else
            this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: NamedImportExportSpecifierStructureToTextItem) {
        const specifierWriter = this.getNewWriterWithQueuedChildIndentation(writer);
        if (typeof structure === "string")
            specifierWriter.write(structure);
        else if (structure instanceof Function)
            structure(specifierWriter);
        else {
            specifierWriter.write(structure.name);

            if (!StringUtils.isNullOrWhitespace(structure.alias)) {
                if (!specifierWriter.isLastNewLine())
                    specifierWriter.space();
                specifierWriter.write(`as ${structure.alias}`);
            }
        }
        writer.write(specifierWriter.toString());
    }
}
