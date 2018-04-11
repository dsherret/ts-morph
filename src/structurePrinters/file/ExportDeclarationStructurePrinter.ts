import CodeBlockWriter from "code-block-writer";
import * as errors from "../../errors";
import {SupportedFormatCodeSettings} from "../../options";
import {ExportDeclarationStructure, ExportSpecifierStructure} from "../../structures";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {StructurePrinter} from "../StructurePrinter";
import {NamedImportExportSpecifierStructurePrinter} from "./NamedImportExportSpecifierStructurePrinter";

export class ExportDeclarationStructurePrinter extends StructurePrinter<ExportDeclarationStructure> {
    private readonly namedImportExportSpecifierStructurePrinter = new NamedImportExportSpecifierStructurePrinter(this.formatSettings);
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    constructor(private readonly formatSettings: SupportedFormatCodeSettings) {
        super();
    }

    printTexts(writer: CodeBlockWriter, structures: ExportDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ExportDeclarationStructure) {
        const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
        writer.write("export");
        if (structure.namedExports != null && structure.namedExports.length > 0) {
            writer.space();
            this.namedImportExportSpecifierStructurePrinter.printTextsWithBraces(writer, structure.namedExports);
        }
        else if (!hasModuleSpecifier)
            writer.write(" {")
                .conditionalWrite(this.formatSettings.insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ") // compiler does this
                .write("}");
        else
            writer.write(` *`);

        if (hasModuleSpecifier) {
            writer.write(" from ");
            writer.quote(structure.moduleSpecifier!);
        }
        writer.write(";");
    }
}
