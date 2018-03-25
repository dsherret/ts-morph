import CodeBlockWriter from "code-block-writer";
import * as errors from "../../errors";
import {SupportedFormatCodeSettings} from "../../options";
import {ExportDeclarationStructure, ExportSpecifierStructure} from "../../structures";
import {StructureToText} from "../StructureToText";
import {NamedImportExportSpecifierStructureToText} from "./NamedImportExportSpecifierStructureToText";

export class ExportDeclarationStructureToText extends StructureToText<ExportDeclarationStructure> {
    private readonly namedImportExportSpecifierStructureToText: NamedImportExportSpecifierStructureToText;

    constructor(writer: CodeBlockWriter, private readonly formatSettings: SupportedFormatCodeSettings) {
        super(writer);
        this.namedImportExportSpecifierStructureToText = new NamedImportExportSpecifierStructureToText(writer, formatSettings);
    }

    writeText(structure: ExportDeclarationStructure) {
        const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
        this.writer.write("export");
        if (structure.namedExports != null && structure.namedExports.length > 0) {
            this.writer.space();
            this.namedImportExportSpecifierStructureToText.writeTextsWithBraces(structure.namedExports);
        }
        else if (!hasModuleSpecifier)
            this.writer.write(" {")
                .conditionalWrite(this.formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ") // compiler does this
                .write("}");
        else
            this.writer.write(` *`);

        if (hasModuleSpecifier) {
            this.writer.write(" from ");
            this.writer.quote(structure.moduleSpecifier!);
        }
        this.writer.write(";");
    }
}
