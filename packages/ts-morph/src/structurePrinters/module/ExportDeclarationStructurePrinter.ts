import { errors, StringUtils } from "@ts-morph/common";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { ExportDeclarationStructure, OptionalKind } from "../../structures";
import { NewLineFormattingStructuresPrinter } from "../formatting";
import { NodePrinter } from "../NodePrinter";

export class ExportDeclarationStructurePrinter extends NodePrinter<OptionalKind<ExportDeclarationStructure>> {
  readonly #multipleWriter = new NewLineFormattingStructuresPrinter(this);

  printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ExportDeclarationStructure>> | undefined) {
    this.#multipleWriter.printText(writer, structures);
  }

  protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ExportDeclarationStructure>) {
    const hasModuleSpecifier = structure.moduleSpecifier != null && structure.moduleSpecifier.length > 0;
    const hasNamedImport = structure.namedExports != null && structure.namedExports.length > 0;

    if (hasNamedImport && structure.namespaceExport != null)
      throw new errors.InvalidOperationError("An export declaration cannot have both a namespace export and a named export.");

    writer.write("export");

    if (structure.isTypeOnly)
      writer.write(" type");

    if (structure.namedExports != null && structure.namedExports.length > 0) {
      writer.space();
      this.factory.forNamedImportExportSpecifier().printTextsWithBraces(writer, structure.namedExports);
    } else if (structure.namespaceExport != null) {
      writer.write(" *");
      if (!StringUtils.isNullOrWhitespace(structure.namespaceExport))
        writer.write(` as ${structure.namespaceExport}`);
    } else if (!hasModuleSpecifier) {
      writer.write(" {")
        .conditionalWrite(this.factory.getFormatCodeSettings().insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces, " ") // compiler does this
        .write("}");
    } else {
      writer.write(` *`);
    }

    if (hasModuleSpecifier) {
      writer.write(" from ");
      writer.quote(structure.moduleSpecifier!);
    }
    // assert clause
    if (structure.attributes) {
      writer.space();
      this.factory.forImportAttribute().printAttributes(writer, structure.attributes);
    }
    writer.write(";");
  }
}
