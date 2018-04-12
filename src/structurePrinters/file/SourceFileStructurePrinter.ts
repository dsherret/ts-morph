import CodeBlockWriter from "code-block-writer";
import {SourceFileStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {SupportedFormatCodeSettings} from "../../options";
import {StructurePrinter} from "../StructurePrinter";
import {BodyTextStructurePrinter} from "../statement";
import {ImportDeclarationStructurePrinter} from "./ImportDeclarationStructurePrinter";
import {ExportDeclarationStructurePrinter} from "./ExportDeclarationStructurePrinter";

export class SourceFileStructurePrinter extends StructurePrinter<SourceFileStructure> {
    private readonly bodyTextWriter = new BodyTextStructurePrinter({ isAmbient: this.options.isAmbient });
    private readonly importWriter = new ImportDeclarationStructurePrinter(this.formatSettings);
    private readonly exportWriter = new ExportDeclarationStructurePrinter(this.formatSettings);

    constructor(private readonly formatSettings: SupportedFormatCodeSettings, private readonly options: { isAmbient: boolean; }) {
        super();
    }

    printText(writer: CodeBlockWriter, structure: SourceFileStructure) {
        this.importWriter.printTexts(writer, structure.imports);

        this.bodyTextWriter.printText(writer, structure);

        this.conditionalBlankLine(writer, structure.exports);
        this.exportWriter.printTexts(writer, structure.exports);

        writer.conditionalNewLine(!writer.isAtStartOfFirstLineOfBlock() && !writer.isLastNewLine());
    }

    private conditionalBlankLine(writer: CodeBlockWriter, structures: any[] | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures))
            writer.conditionalBlankLine(!writer.isAtStartOfFirstLineOfBlock());
    }
}
