import CodeBlockWriter from "code-block-writer";
import * as errors from "../../errors";
import {ImportDeclarationStructure, ImportSpecifierStructure} from "../../structures";
import {SupportedFormatCodeSettings} from "../../options";
import {NewLineFormattingStructuresPrinter} from "../formatting";
import {StructurePrinter} from "../StructurePrinter";
import {NamedImportExportSpecifierStructurePrinter} from "./NamedImportExportSpecifierStructurePrinter";

export class ImportDeclarationStructurePrinter extends StructurePrinter<ImportDeclarationStructure> {
    private readonly namedImportExportSpecifierStructurePrinter: NamedImportExportSpecifierStructurePrinter;
    private readonly multipleWriter = new NewLineFormattingStructuresPrinter(this.writer, this);

    constructor(writer: CodeBlockWriter, private readonly formatSettings: SupportedFormatCodeSettings) {
        super(writer);
        this.namedImportExportSpecifierStructurePrinter = new NamedImportExportSpecifierStructurePrinter(writer, formatSettings);
    }

    printTexts(structures: ImportDeclarationStructure[] | undefined) {
        this.multipleWriter.printText(structures);
    }

    printText(structure: ImportDeclarationStructure) {
        const hasNamedImport = structure.namedImports != null && structure.namedImports.length > 0;
        // validation
        if (hasNamedImport && structure.namespaceImport != null)
            throw new errors.InvalidOperationError("An import declaration cannot have both a namespace import and a named import.");

        this.writer.write("import");
        // default import
        if (structure.defaultImport != null) {
            this.writer.write(` ${structure.defaultImport}`);
            this.writer.conditionalWrite(hasNamedImport || structure.namespaceImport != null, ",");
        }
        // namespace import
        if (structure.namespaceImport != null)
            this.writer.write(` * as ${structure.namespaceImport}`);
        // named imports
        if (structure.namedImports != null && structure.namedImports.length > 0) {
            this.writer.space();
            this.namedImportExportSpecifierStructurePrinter.printTextsWithBraces(structure.namedImports);
        }
        // from keyword
        this.writer.conditionalWrite(structure.defaultImport != null || hasNamedImport || structure.namespaceImport != null, " from");
        this.writer.write(" ");
        this.writer.quote(structure.moduleSpecifier);
        this.writer.write(";");
    }
}
