import CodeBlockWriter from "code-block-writer";
import * as errors from "../../errors";
import {SupportedFormatCodeSettings} from "../../options";
import {ExportDeclarationStructure, ExportSpecifierStructure} from "../../structures";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {StructurePrinter} from "../StructurePrinter";
import {NamedImportExportSpecifierStructurePrinter} from "./NamedImportExportSpecifierStructurePrinter";

export class ExportDeclarationStructurePrinter extends StructurePrinter<ExportDeclarationStructure> {
    private readonly namedImportExportSpecifierStructurePrinter: NamedImportExportSpecifierStructurePrinter;
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this.writer, this);

    constructor(writer: CodeBlockWriter, private readonly formatSettings: SupportedFormatCodeSettings) {
        super(writer);
        this.namedImportExportSpecifierStructurePrinter = new NamedImportExportSpecifierStructurePrinter(writer, formatSettings);
    }

    printTexts(structures: ExportDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(structures);
    }

    printText(structure: ExportDeclarationStructure) {
        const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
        this.writer.write("export");
        if (structure.namedExports != null && structure.namedExports.length > 0) {
            this.writer.space();
            this.namedImportExportSpecifierStructurePrinter.printTextsWithBraces(structure.namedExports);
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
