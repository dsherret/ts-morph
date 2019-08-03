import { CodeBlockWriter } from "../../codeBlockWriter";
import { ExportDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class ExportDeclarationStructurePrinter extends NodePrinter<OptionalKind<ExportDeclarationStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ExportDeclarationStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ExportDeclarationStructure>) {
        const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
        writer.write("export");
        if (structure.namedExports != null && structure.namedExports.length > 0) {
            writer.space();
            this.factory.forNamedImportExportSpecifier().printTextsWithBraces(writer, structure.namedExports);
        }
        else if (!hasModuleSpecifier) {
            writer.write(" {")
                .conditionalWrite(this.factory.getFormatCodeSettings().insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ") // compiler does this
                .write("}");
        }
        else {
            writer.write(` *`);
        }

        if (hasModuleSpecifier) {
            writer.write(" from ");
            writer.quote(structure.moduleSpecifier!);
        }
        writer.write(";");
    }
}
