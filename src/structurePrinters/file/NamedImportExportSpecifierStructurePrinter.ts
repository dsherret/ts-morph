import CodeBlockWriter from "code-block-writer";
import {ImportSpecifierStructure, ExportSpecifierStructure} from "../../structures";
import {SupportedFormatCodeSettings} from "../../options";
import {StructurePrinter} from "../StructurePrinter";
import {CommaSeparatedStructuresPrinter} from "../formatting";

export type NamedImportExportSpecifierStructureToTextItem = ImportSpecifierStructure | ExportSpecifierStructure | string;

export class NamedImportExportSpecifierStructurePrinter extends StructurePrinter<NamedImportExportSpecifierStructureToTextItem> {
    private readonly commaSeparatedWriter: CommaSeparatedStructuresPrinter<NamedImportExportSpecifierStructureToTextItem>;

    constructor(private readonly formatSettings: SupportedFormatCodeSettings) {
        super();
        this.commaSeparatedWriter = new CommaSeparatedStructuresPrinter(this);
    }

    printTextsWithBraces(writer: CodeBlockWriter, structures: NamedImportExportSpecifierStructureToTextItem[]) {
        writer.write("{").conditionalWrite(this.formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ");
        this.printTexts(writer, structures);
        writer.conditionalWrite(this.formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ").write("}");
    }

    printTexts(writer: CodeBlockWriter, structures: NamedImportExportSpecifierStructureToTextItem[]) {
        this.commaSeparatedWriter.printText(writer, structures);
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
