import CodeBlockWriter from "code-block-writer";
import {ImportSpecifierStructure, ExportSpecifierStructure} from "../../structures";
import {SupportedFormatCodeSettings} from "../../options";
import {StructurePrinter} from "../StructurePrinter";
import {CommaSeparatedStructuresPrinter} from "../formatting";

export type NamedImportExportSpecifierStructureToTextItem = ImportSpecifierStructure | ExportSpecifierStructure | string;

export class NamedImportExportSpecifierStructurePrinter extends StructurePrinter<NamedImportExportSpecifierStructureToTextItem> {
    private readonly commaSeparatedWriter: CommaSeparatedStructuresPrinter<NamedImportExportSpecifierStructureToTextItem>;

    constructor(writer: CodeBlockWriter, private readonly formatSettings: SupportedFormatCodeSettings) {
        super(writer);
        this.commaSeparatedWriter = new CommaSeparatedStructuresPrinter(writer, this);
    }

    printTextsWithBraces(structures: NamedImportExportSpecifierStructureToTextItem[]) {
        this.writer.write("{").conditionalWrite(this.formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ");
        this.printTexts(structures);
        this.writer.conditionalWrite(this.formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ").write("}");
    }

    printTexts(structures: NamedImportExportSpecifierStructureToTextItem[]) {
        this.commaSeparatedWriter.printText(structures);
    }

    printText(structure: NamedImportExportSpecifierStructureToTextItem) {
        if (typeof structure === "string")
            this.writer.write(structure);
        else {
            this.writer.write(structure.name);
            this.writer.conditionalWrite(structure.alias != null, ` as ${structure.alias}`);
        }
    }
}
