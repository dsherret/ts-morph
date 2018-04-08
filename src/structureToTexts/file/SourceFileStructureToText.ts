import CodeBlockWriter from "code-block-writer";
import {SourceFileStructure} from "../../structures";
import {ArrayUtils} from "../../utils";
import {SupportedFormatCodeSettings} from "../../options";
import {StructureToText} from "../StructureToText";
import {BodyTextStructureToText} from "../statement";
import {ImportDeclarationStructureToText} from "./ImportDeclarationStructureToText";
import {ExportDeclarationStructureToText} from "./ExportDeclarationStructureToText";

export class SourceFileStructureToText extends StructureToText<SourceFileStructure> {
    private readonly bodyTextWriter = new BodyTextStructureToText(this.writer, { isAmbient: this.options.isAmbient });
    private readonly importWriter = new ImportDeclarationStructureToText(this.writer, this.options.formatSettings);
    private readonly exportWriter = new ExportDeclarationStructureToText(this.writer, this.options.formatSettings);

    constructor(writer: CodeBlockWriter, private readonly options: { formatSettings: SupportedFormatCodeSettings; isAmbient: boolean; }) {
        super(writer);
    }

    writeText(structure: SourceFileStructure) {
        this.importWriter.writeTexts(structure.imports);

        this.bodyTextWriter.writeText(structure);

        this.conditionalBlankLine(structure.exports);
        this.exportWriter.writeTexts(structure.exports);

        this.writer.conditionalNewLine(!this.writer.isAtStartOfFirstLineOfBlock() && !this.writer.isLastNewLine());
    }

    private conditionalBlankLine(structures: any[] | undefined) {
        if (!ArrayUtils.isNullOrEmpty(structures))
            this.writer.conditionalBlankLine(!this.writer.isAtStartOfFirstLineOfBlock());
    }
}
