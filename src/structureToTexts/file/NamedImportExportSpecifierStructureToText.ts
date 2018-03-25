import CodeBlockWriter from "code-block-writer";
import {ImportSpecifierStructure, ExportSpecifierStructure} from "../../structures";
import {SupportedFormatCodeSettings} from "../../options";
import {StructureToText} from "../StructureToText";
import {CommaSeparatedStructuresToText} from "../formatting";

export type NamedImportExportSpecifierStructureToTextItem = ImportSpecifierStructure | ExportSpecifierStructure | string;

export class NamedImportExportSpecifierStructureToText extends StructureToText<NamedImportExportSpecifierStructureToTextItem> {
    private readonly commaSeparatedWriter: CommaSeparatedStructuresToText<NamedImportExportSpecifierStructureToTextItem>;

    constructor(writer: CodeBlockWriter, private readonly formatSettings: SupportedFormatCodeSettings) {
        super(writer);
        this.commaSeparatedWriter = new CommaSeparatedStructuresToText(writer, this);
    }

    writeTextsWithBraces(structures: NamedImportExportSpecifierStructureToTextItem[]) {
        this.writer.write("{").conditionalWrite(this.formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ");
        this.writeTexts(structures);
        this.writer.conditionalWrite(this.formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ").write("}");
    }

    writeTexts(structures: NamedImportExportSpecifierStructureToTextItem[]) {
        this.commaSeparatedWriter.writeText(structures);
    }

    writeText(structure: NamedImportExportSpecifierStructureToTextItem) {
        if (typeof structure === "string")
            this.writer.write(structure);
        else {
            this.writer.write(structure.name);
            this.writer.conditionalWrite(structure.alias != null, ` as ${structure.alias}`);
        }
    }
}
