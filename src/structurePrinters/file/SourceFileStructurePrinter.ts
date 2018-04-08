import CodeBlockWriter from "code-block-writer";
import {SourceFileStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {SupportedFormatCodeSettings} from "../../options";
import {StructurePrinter} from "../StructurePrinter";
import {BodyTextStructurePrinter} from "../statement";
import {ImportDeclarationStructurePrinter} from "./ImportDeclarationStructurePrinter";
import {ExportDeclarationStructurePrinter} from "./ExportDeclarationStructurePrinter";

export class SourceFileStructurePrinter extends StructurePrinter<SourceFileStructure> {
    private readonly bodyTextWriter = new BodyTextStructurePrinter(this.writer, { isAmbient: this.options.isAmbient });
    private readonly importWriter = new ImportDeclarationStructurePrinter(this.writer, this.options.formatSettings);
    private readonly exportWriter = new ExportDeclarationStructurePrinter(this.writer, this.options.formatSettings);

    constructor(writer: CodeBlockWriter, private readonly options: { formatSettings: SupportedFormatCodeSettings; isAmbient: boolean; }) {
        super(writer);
    }

    printText(structure: SourceFileStructure) {
        this.importWriter.printTexts(structure.imports);

        this.bodyTextWriter.printText(structure);

        this.conditionalBlankLine(structure.exports);
        this.exportWriter.printTexts(structure.exports);

        this.writer.conditionalNewLine(!this.writer.isAtStartOfFirstLineOfBlock() && !this.writer.isLastNewLine());
    }

    private conditionalBlankLine(structures: any[] | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures))
            this.writer.conditionalBlankLine(!this.writer.isAtStartOfFirstLineOfBlock());
    }
}
