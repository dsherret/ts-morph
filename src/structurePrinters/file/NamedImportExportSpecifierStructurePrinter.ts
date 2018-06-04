import { CodeBlockWriter } from "../../codeBlockWriter";
import { ExportSpecifierStructure, ImportSpecifierStructure } from "../../structures";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";
import { CommaSeparatedStructuresPrinter } from "../formatting";

export type NamedImportExportSpecifierStructureToTextItem = ImportSpecifierStructure | ExportSpecifierStructure | string;

export class NamedImportExportSpecifierStructurePrinter extends FactoryStructurePrinter<NamedImportExportSpecifierStructureToTextItem> {
    private readonly multipleWriter = new CommaSeparatedStructuresPrinter(this);

    printTextsWithBraces(writer: CodeBlockWriter, structures: NamedImportExportSpecifierStructureToTextItem[]) {
        const formatSettings = this.factory.getFormatCodeSettings();
        writer.write("{").conditionalWrite(formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ");
        this.printTexts(writer, structures);
        writer.conditionalWrite(formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ").write("}");
    }

    printTexts(writer: CodeBlockWriter, structures: NamedImportExportSpecifierStructureToTextItem[]) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: NamedImportExportSpecifierStructureToTextItem) {
        if (typeof structure === "string")
            writer.write(structure);
        else {
            writer.write(structure.name);
            writer.conditionalWrite(structure.alias != null, ` as ${structure.alias}`);
        }
    }
}
