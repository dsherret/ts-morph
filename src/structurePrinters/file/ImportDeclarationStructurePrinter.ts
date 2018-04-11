import CodeBlockWriter from "code-block-writer";
import * as errors from "../../errors";
import {ImportDeclarationStructure, ImportSpecifierStructure} from "../../structures";
import {SupportedFormatCodeSettings} from "../../options";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {StructurePrinter} from "../StructurePrinter";
import {NamedImportExportSpecifierStructurePrinter} from "./NamedImportExportSpecifierStructurePrinter";

export class ImportDeclarationStructurePrinter extends StructurePrinter<ImportDeclarationStructure> {
    private readonly namedImportExportSpecifierStructurePrinter: NamedImportExportSpecifierStructurePrinter;
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this);

    constructor(private readonly formatSettings: SupportedFormatCodeSettings) {
        super();
        this.namedImportExportSpecifierStructurePrinter = new NamedImportExportSpecifierStructurePrinter(formatSettings);
    }

    printTexts(writer: CodeBlockWriter, structures: ImportDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(writer, structures);
    }

    printText(writer: CodeBlockWriter, structure: ImportDeclarationStructure) {
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
            this.namedImportExportSpecifierStructurePrinter.printTextsWithBraces(writer, structure.namedImports);
        }
        // from keyword
        writer.conditionalWrite(structure.defaultImport != null || hasNamedImport || structure.namespaceImport != null, " from");
        writer.write(" ");
        writer.quote(structure.moduleSpecifier);
        writer.write(";");
    }
}
