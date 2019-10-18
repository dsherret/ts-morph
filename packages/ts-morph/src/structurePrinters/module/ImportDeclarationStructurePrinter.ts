import { CodeBlockWriter } from "../../codeBlockWriter";
import { errors } from "@ts-morph/common";
import { ImportDeclarationStructure, OptionalKind } from "../../structures";
import { NodePrinter } from "../NodePrinter";
import { NewLineFormattingStructuresPrinter } from "../formatting";

export class ImportDeclarationStructurePrinter extends NodePrinter<OptionalKind<ImportDeclarationStructure>> {
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    protected printTextInternal(writer: CodeBlockWriter, structure: OptionalKind<ImportDeclarationStructure>) {
        const hasNamedImport = structure.namedImports != null && structure.namedImports.length > 0;
        // validation
        if (hasNamedImport && structure.namespaceImport != null)
            throw new errors.InvalidOperationError("An import declaration cannot have both a namespace import and a named import.");

        writer.write("import");
        // default import
        if (structure.defaultImport != null) {
            writer.write(` ${structure.defaultImport}`);
            writer.conditionalWrite(hasNamedImport || structure.namespaceImport != null, ",");
        }
        // namespace import
        if (structure.namespaceImport != null)
            writer.write(` * as ${structure.namespaceImport}`);
        // named imports
        if (structure.namedImports != null && structure.namedImports.length > 0) {
            writer.space();
            this.factory.forNamedImportExportSpecifier().printTextsWithBraces(writer, structure.namedImports);
        }
        // from keyword
        writer.conditionalWrite(structure.defaultImport != null || hasNamedImport || structure.namespaceImport != null, " from");
        writer.write(" ");
        writer.quote(structure.moduleSpecifier);
        writer.write(";");
    }
}
