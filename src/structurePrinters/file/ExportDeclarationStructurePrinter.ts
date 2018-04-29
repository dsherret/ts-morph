import { CodeBlockWriter } from "../../codeBlockWriter";
import * as errors from "../../errors";
import { ExportDeclarationStructure, ExportSpecifierStructure } from "../../structures";
import { NewLineFormattingStructuresPrinter } from "../formatting";
import { FactoryStructurePrinter } from "../FactoryStructurePrinter";

export class ExportDeclarationStructurePrinter extends FactoryStructurePrinter<ExportDeclarationStructure> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ExportDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ExportDeclarationStructure) {
        const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
        writer.write("export");
        if (structure.namedExports != null && structure.namedExports.length > 0) {
            writer.space();
            this.factory.forNamedImportExportSpecifier().printTextsWithBraces(writer, structure.namedExports);
        }
        else if (!hasModuleSpecifier)
            writer.write(" {")
                .conditionalWrite(this.factory.getFormatCodeSettings().insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ") // compiler does this
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
